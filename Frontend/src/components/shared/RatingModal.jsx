import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LuStar } from '@/utils/icons';
import { submitRating } from '@/store/rentalSlice';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function RatingModal({ open, onOpenChange, request }) {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const active = hovered || rating;

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setRating(0);
      setHovered(0);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    if (!rating || !request) return;
    setSubmitting(true);
    try {
      await dispatch(submitRating({ id: request.id, rating })).unwrap();
      toast.success('Thanks for rating your experience!');
      handleClose(false);
    } catch (err) {
      toast.error(err || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle className='font-serif text-app-primary'>
            Rate your experience
          </DialogTitle>
          <DialogDescription>
            How was borrowing with this partner? Your rating helps build a
            trusted community.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col items-center gap-3 py-2'>
          <div className='flex items-center gap-1.5' role='radiogroup' aria-label='Rating'>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type='button'
                role='radio'
                aria-checked={rating === value}
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
                disabled={submitting}
                className='transition-transform hover:scale-110 disabled:pointer-events-none'
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(value)}
              >
                <LuStar
                  className={`size-8 transition-colors ${
                    value <= active
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className='text-sm font-medium text-muted-foreground h-5'>
            {RATING_LABELS[active]}
          </p>
        </div>

        <DialogFooter>
          <Button variant='outline' disabled={submitting} onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            className='bg-app-primary/90 hover:bg-app-primary'
            disabled={!rating || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
