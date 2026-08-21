import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RequestCard from '@/components/lender/RequestCard';
import RatingModal from '@/components/shared/RatingModal';
import {
  fetchIncomingRequests,
  approveRequest,
  rejectRequest,
  confirmLend,
  markReturned,
} from '@/store/rentalSlice';
import { Skeleton } from '@/components/ui/skeleton';
import useItemDetails from '@/hooks/useItemDetails';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const Requests = () => {
  const dispatch = useDispatch();
  const { incomingRequests, status, pagination } = useSelector((state) => state.rental);
  const [ratingRequest, setRatingRequest] = useState(null);

  useEffect(() => {
    dispatch(fetchIncomingRequests({ page: 1, limit: PAGE_SIZE }));
  }, [dispatch]);

  const itemsById = useItemDetails(incomingRequests.map((r) => r.itemId));

  const grouped = incomingRequests.reduce((acc, request) => {
    if (!acc[request.itemId]) acc[request.itemId] = [];
    acc[request.itemId].push(request);
    return acc;
  }, {});

  const pending = incomingRequests.filter((r) => r.status === 'pending').length;
  const active = incomingRequests.filter((r) =>
    ['approved', 'agreement_pending', 'borrowed'].includes(r.status),
  ).length;
  const completed = incomingRequests.filter((r) =>
    ['returned', 'rated'].includes(r.status),
  ).length;

  const statsMap = [
    { title: 'Pending', value: pending, textColor: 'text-black' },
    { title: 'Active', value: active, textColor: 'text-app-secondary' },
    { title: 'Completed', value: completed, textColor: 'text-gray-500' },
  ];

  const runAction = async (thunk, id, successMessage) => {
    try {
      await dispatch(thunk(id)).unwrap();
      toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(err || 'Something went wrong');
      return false;
    }
  };

  const handleApprove = (id) => runAction(approveRequest, id, 'Request approved!');
  const handleReject = (id) => runAction(rejectRequest, id, 'Request rejected');
  const handleConfirmLend = (id) =>
    runAction(confirmLend, id, 'Lend confirmed — awaiting borrower agreement');
  const handleMarkReturned = (id) =>
    runAction(markReturned, id, 'Outfit marked as returned');

  if (status === 'loading' && incomingRequests.length === 0) {
    return (
      <section className='grow container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          <div className='flex flex-col'>
            <h2 className='font-serif text-app-primary text-3xl font-bold'>Borrow Requests</h2>
            <p className='text-muted-foreground'>Review and respond to requests for your outfits</p>
          </div>
          <Card>
            <CardContent>
              <div className='flex items-center justify-between'>
                {statsMap.map((stat) => (
                  <div key={stat.title} className='text-center flex-1'>
                    <Skeleton className='h-8 w-16 mx-auto' />
                    <Skeleton className='h-4 w-3/4 mx-auto mt-2' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className='space-y-6'>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className='space-y-6'>
                  <Skeleton className='h-20 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='grow container mx-auto px-4 py-8'>
      <div className='space-y-6'>
        <div className='flex flex-col'>
          <h2 className='font-serif text-app-primary text-3xl font-bold'>Borrow Requests</h2>
          <p className='text-muted-foreground'>Review and respond to requests for your outfits</p>
        </div>
        {/* Stats Card */}
        <Card>
          <CardContent>
            <div className='flex items-center justify-between'>
              {statsMap.map((stat) => (
                <div key={stat.title} className='text-center flex-1'>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  <p className='text-sm text-muted-foreground'>{stat.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {Object.keys(grouped).length === 0 && status !== 'loading' && (
          <Card>
            <CardContent className='text-center py-10 text-muted-foreground'>
              There are no requests for your outfits yet.
            </CardContent>
          </Card>
        )}

        <div className='space-y-6'>
          {Object.entries(grouped).map(([itemId, requests]) => {
            const item = itemsById[itemId];
            return (
              <Card key={itemId}>
                <CardHeader>
                  <div className='flex items-center gap-4'>
                    {item?.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title || 'Outfit'}
                        className='w-20 h-20 object-cover rounded-lg'
                      />
                    ) : (
                      <div className='w-20 h-20 rounded-lg bg-muted animate-pulse' />
                    )}
                    <div className='flex-1'>
                      <CardTitle className='font-serif text-app-primary text-lg'>
                        {item?.title || 'Outfit'}
                      </CardTitle>
                      <CardDescription>{item?.category}</CardDescription>
                    </div>
                    <Badge className='rounded-sm bg-app-secondary text-white'>
                      {requests.length} Request{requests.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {requests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onConfirmLend={handleConfirmLend}
                      onMarkReturned={handleMarkReturned}
                      onRate={setRatingRequest}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {pagination.pages > 1 && (
          <div className='flex justify-center gap-2 mt-6'>
            <button
              className='px-4 py-2 border rounded hover:bg-muted disabled:opacity-50'
              disabled={pagination.page === 1}
              onClick={() =>
                dispatch(fetchIncomingRequests({ page: pagination.page - 1, limit: PAGE_SIZE }))
              }
            >
              Previous
            </button>
            <span className='flex items-center px-4'>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className='px-4 py-2 border rounded hover:bg-muted disabled:opacity-50'
              disabled={pagination.page === pagination.pages}
              onClick={() =>
                dispatch(fetchIncomingRequests({ page: pagination.page + 1, limit: PAGE_SIZE }))
              }
            >
              Next
            </button>
          </div>
        )}
      </div>

      <RatingModal
        open={!!ratingRequest}
        onOpenChange={(open) => !open && setRatingRequest(null)}
        request={ratingRequest}
      />
    </section>
  );
};

export default Requests;
