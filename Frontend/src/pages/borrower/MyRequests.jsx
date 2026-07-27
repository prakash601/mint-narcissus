import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import RequestCard from '@/components/borrower/RequestCard';
import { fetchMyRequests, cancelRequest } from '@/store/rentalSlice';
import { Skeleton } from '@/components/ui/skeleton';

const MyRequests = () => {
  const dispatch = useDispatch();
  const { myRequests, status } = useSelector((state) => state.rental);

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  if (status === 'loading' && myRequests.length === 0) {
    return (
      <section className='grow container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          <div>
            <h2 className='font-serif text-app-primary text-3xl font-bold'>My Borrow Requests</h2>
            <p className='text-muted-foreground'>Track the status of your outfit requests</p>
          </div>
          <Card>
            <CardContent className='py-10'>
              <div className='space-y-4'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='flex gap-4'>
                    <Skeleton className='h-12 w-12 rounded-full' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-1/4' />
                      <Skeleton className='h-3 w-1/2' />
                      <Skeleton className='h-3 w-1/3' />
                    </div>
                    <Skeleton className='h-8 w-24' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className='grow container mx-auto px-4 py-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h2 className='font-serif text-app-primary text-3xl font-bold'>My Borrow Requests</h2>
          <p className='text-muted-foreground'>Track the status of your outfit requests</p>
        </div>

        {/* Empty State */}
        {myRequests.length === 0 && (
          <Card>
            <CardContent className='text-center py-10 text-muted-foreground'>
              You haven't requested any outfits yet.
            </CardContent>
          </Card>
        )}

        {/* Requests */}
        {myRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onCancel={(id) => dispatch(cancelRequest(id))}
          />
        ))}
      </div>
    </section>
  );
};

export default MyRequests;