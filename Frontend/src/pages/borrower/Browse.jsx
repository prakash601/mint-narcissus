import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Filter from '@/components/borrower/Filter';
import OutfitsContainer from '@/components/outfits/OutfitsContainer';
import EmptyState from '../shared/EmptyState';
import { TbHangerOff } from '@/utils/icons';
import { fetchFeed } from '@/store/itemsSlice';
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

export default function Browse() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, status, pagination } = useSelector((state) => state.items);

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

  const updateFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (!value || value === 'All') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
        return newParams;
      });
    },
    [setSearchParams],
  );

  const clearFilters = () => {
    setSearchParams({});
  };

  useEffect(() => {
    dispatch(fetchFeed({ ...filters, page: 1, limit: 12 }));
  }, [filters, dispatch]);

  if (status === 'loading' && items.length === 0) {
    return (
      <section className='grow py-6 px-8'>
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
      </section>
    );
  }

  return (
    <section className='grow py-6 px-8'>
      {items.length === 0 && status !== 'loading' ? (
<EmptyState
            title='No outfits available yet'
            description="We're working on adding more interview-ready outfits. Please check back soon."
            icon={<TbHangerOff size='40' className='text-muted-foreground/30' />}
          />
      ) : (
        <div>
          <Filter
            filters={filters}
            updateFilter={updateFilter}
            onClear={clearFilters}
            defaultFilters={defaultFilters}
          />
          {items.length === 0 && status !== 'loading' ? (
            <EmptyState
              title='No outfits match your filters'
              description='Try adjusting your size filters to see more options.'
              actionLabel='Clear Filters'
              onAction={clearFilters}
            />
          ) : (
            <>
              <OutfitsContainer outfits={items} />
              {pagination.totalPages > 1 && (
                <div className='flex justify-center mt-6 gap-2'>
                  <button
                    className='px-4 py-2 border rounded hover:bg-muted disabled:opacity-50'
                    disabled={pagination.page === 1}
                    onClick={() => dispatch(fetchFeed({ ...filters, page: pagination.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span className='flex items-center px-4'>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className='px-4 py-2 border rounded hover:bg-muted disabled:opacity-50'
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => dispatch(fetchFeed({ ...filters, page: pagination.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}