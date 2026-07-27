import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Filter from '@/components/borrower/Filter';
import OutfitsContainer from '@/components/outfits/OutfitsContainer';
import { filterOutfits } from '@/utils/filterOutfit';
import EmptyState from '../shared/EmptyState';
import { LuHeart } from '@/utils/icons';
import { fetchSavedItems } from '@/store/itemsSlice';
import { Skeleton } from '@/components/ui/skeleton';

const defaultFilters = {
  category: 'All',
  interviewType: 'All',
  availability: 'All',
  topSize: 'All',
  bottomSize: 'All',
  height: 'All',
  fitType: 'All',
  search: '',
};

export default function Saved() {
  const dispatch = useDispatch();
  const { savedItems, status } = useSelector((state) => state.items);

  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      interviewType: searchParams.get('interviewType') || '',
      availability: searchParams.get('availability') || '',
      topSize: searchParams.get('topSize') || '',
      bottomSize: searchParams.get('bottomSize') || '',
      height: searchParams.get('height') || '',
      fitType: searchParams.get('fitType') || '',
    }),
    [searchParams],
  );

  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (!value || value === 'All') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      return newParams;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  useEffect(() => {
    dispatch(fetchSavedItems());
  }, [dispatch]);

  const filteredSaved = useMemo(() => {
    return filterOutfits(savedItems, filters);
  }, [savedItems, filters]);

  if (status === 'loading' && savedItems.length === 0) {
    return (
      <section className='grow py-8 px-4'>
        <h2 className='font-serif font-bold text-app-primary text-3xl leading-snug'>Saved Outfits</h2>
        <h3 className='text-muted-foreground text-sm'>Your collection of interview-ready outfits</h3>
        <div className='w-full my-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='space-y-3'>
                <Skeleton className='h-64 w-full rounded-lg' />
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-4 w-1/3' />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='grow py-8 px-4'>
      <h2
        id='saved-heading'
        className='font-serif font-bold text-app-primary text-3xl leading-snug'
      >
        Saved Outfits
      </h2>
      <h3 className='text-muted-foreground text-sm'>
        Your collection of interview-ready outfits
      </h3>
      {savedItems.length === 0 ? (
        <EmptyState
          title='No saved outfits yet'
          description="You haven't saved any outfits yet. Browse available outfits and save your favorites."
          icon={<LuHeart size='40' className='text-app-saved/30' />}
          redirectPath='/'
          onAction={() => {}}
          actionLabel='Browse Outfits'
        />
      ) : (
        <div className='w-full my-6'>
          <Filter
            filters={filters}
            updateFilter={updateFilter}
            onClear={clearFilters}
            defaultFilters={defaultFilters}
          />
          {filteredSaved.length === 0 ? (
            <EmptyState
              title='No outfits match your filters'
              description='Try adjusting your size filters to see more options.'
              actionLabel='Clear Filters'
              onAction={clearFilters}
            />
          ) : (
            <OutfitsContainer outfits={filteredSaved} />
          )}
        </div>
      )}
    </section>
  );
}