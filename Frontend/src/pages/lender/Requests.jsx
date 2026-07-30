import { useEffect } from 'react';
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
import { fetchIncomingRequests, approveRequest, rejectRequest } from '@/store/rentalSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Requests = () => {
  const dispatch = useDispatch();
  const { incomingRequests, status, pagination } = useSelector((state) => state.rental);

  useEffect(() => {
    dispatch(fetchIncomingRequests({ page: 1, limit: 10 }));
  }, [dispatch]);

  const grouped = incomingRequests.reduce((acc, request) => {
    if (!acc[request.outfitId]) acc[request.outfitId] = [];
    acc[request.outfitId].push(request);
    return acc;
  }, {});

  const pending = incomingRequests.filter((r) => r.status === 'pending').length;
  const approved = incomingRequests.filter((r) => r.status === 'approved').length;
  const declined = incomingRequests.filter((r) => r.status === 'rejected').length;

  const statsMap = [
    { title: 'Pending', value: pending, textColor: 'text-black' },
    { title: 'Approved', value: approved, textColor: 'text-app-secondary' },
    { title: 'Declined', value: declined, textColor: 'text-gray-500' },
  ];

  const handleApprove = async (id) => {
    try {
      await dispatch(approveRequest(id)).unwrap();
      toast.success('Request approved!');
    } catch (err) {
      toast.error(err || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await dispatch(rejectRequest(id)).unwrap();
      toast.success('Request rejected');
    } catch (err) {
      toast.error(err || 'Failed to reject request');
    }
  };

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
          {Object.entries(grouped).map(([outfitId, requests]) => {
            const outfit = requests[0]?.outfit;
            return (
              <Card key={outfitId}>
                <CardHeader>
                  <div className='flex items-center gap-4'>
                    <img
                      src={outfit?.outfitImageUrl || outfit?.imageUrl}
                      alt={outfit?.title}
                      className='w-20 h-20 object-cover rounded-lg'
                    />
                    <div className='flex-1'>
                      <CardTitle className='font-serif text-app-primary text-lg'>{outfit?.title}</CardTitle>
                      <CardDescription>{outfit?.category}</CardDescription>
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
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {pagination.totalPages > 1 && (
          <div className='flex justify-center gap-2 mt-6'>
            <button
              className='px-4 py-2 border rounded hover:bg-muted disabled:opacity-50'
              disabled={pagination.page === 1}
              onClick={() => dispatch(fetchIncomingRequests({ page: pagination.page - 1, limit: 10 }))}
            >
              Previous
            </button>
            <span className='flex items-center px-4'>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className='px-4 py-2 border rounded hover:bg-muted disabled:opacity-50'
              disabled={pagination.page === pagination.totalPages}
              onClick={() => dispatch(fetchIncomingRequests({ page: pagination.page + 1, limit: 10 }))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Requests;