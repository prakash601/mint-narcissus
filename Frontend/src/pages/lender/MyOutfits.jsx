import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import LentOutfitCard from '../../components/lender/LentOutfitCard';
import { LuInfo } from '@/utils/icons';
import { Button } from '@/components/ui/button';
import { fetchMyItems } from '@/store/itemsSlice';
import { Skeleton } from '@/components/ui/skeleton';

const MyOutfits = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myItems, status } = useSelector((state) => state.items);

  useEffect(() => {
    dispatch(fetchMyItems());
  }, [dispatch]);

  const total = myItems.length;
  const available = myItems.filter((o) => o.status === 'Available').length;
  const borrowed = myItems.filter((o) => o.status === 'Borrowed').length;
  const unavailable = myItems.filter((o) => o.status === 'Unavailable').length;

  const statsMap = [
    { title: 'Total Listed', value: total, textColor: 'text-black' },
    { title: 'Available', value: available, textColor: 'text-emerald-600' },
    { title: 'Currently Lent', value: borrowed, textColor: 'text-amber-600' },
    { title: 'Unavailable', value: unavailable, textColor: 'text-gray-500' },
  ];

  if (status === 'loading' && myItems.length === 0) {
    return (
      <section className='grow container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          <div className='flex flex-col'>
            <h2 className='font-serif text-app-primary text-3xl font-bold'>My Outfits</h2>
            <p className='text-muted-foreground'>Manage your listed outfits</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton className='h-10 w-1/2 mx-auto' />
                  <Skeleton className='h-4 w-3/4 mx-auto mt-2' />
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
          <h2 className='font-serif text-app-primary text-3xl font-bold'>My Outfits</h2>
          <p className='text-muted-foreground'>Manage your listed outfits</p>
        </div>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {statsMap.map((stat) => (
            <Card key={stat.title}>
              <CardContent>
                <div className='text-center'>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  <p className='text-sm text-muted-foreground'>{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Status Guide */}
        <div className='bg-blue-50 border border-blue-100 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <LuInfo className='text-blue-600 size-5' />
            <div className='text-sm text-blue-900'>
              <p className='font-medium mb-1'>Status Guide</p>
              <ul className='space-y-1 text-blue-800'>
                <li>
                  <strong>Available:</strong> Visible in search, borrowers can request
                </li>
                <li>
                  <strong>Borrowed:</strong> Currently with a borrower, hidden from search
                </li>
                <li>
                  <strong>Unavailable:</strong> Hidden from search, you can re-activate anytime
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Listed Outfits */}
        {myItems.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col gap-3 items-center justify-center py-6'>
              <p className='text-muted-foreground'>You haven't listed any outfits yet.</p>
              <Button className='bg-app-primary/95 hover:bg-app-primary' onClick={() => navigate('/list')}>
                List Your First Outfit
              </Button>
            </CardContent>
          </Card>
        ) : (
          myItems.map((o) => <LentOutfitCard key={o.id} outfit={o} />)
        )}
      </div>
    </section>
  );
};

export default MyOutfits;