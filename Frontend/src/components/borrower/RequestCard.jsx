import GetStatusBadge from '../shared/GetStatusBade';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { LuHandshake, LuMessageCircle, LuStar, LuX } from '@/utils/icons';

const RequestCard = ({ request, item, onCancel, onAcceptAgreement, onRate }) => {
  const canCancel = request.status === 'pending';
  const canAcceptAgreement = request.status === 'agreement_pending';
  const canRate =
    request.status === 'returned' && request.ratingsPending && !request.borrowerRated;

  return (
    <Card>
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

          <GetStatusBadge status={request.status} />
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Request Info */}
        <div className='text-sm text-muted-foreground'>
          <p>
            Requested on:{' '}
            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}
          </p>
        </div>

        {/* Contextual Info */}
        {request.status === 'approved' && (
          <div className='bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex items-start gap-2'>
            <LuMessageCircle className='size-4 mt-0.5 shrink-0' />
            Your request has been approved! Head to Messages to coordinate pickup
            with the lender.
          </div>
        )}

        {request.status === 'agreement_pending' && (
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800'>
            The lender confirmed the loan. Accept the lending agreement to make it
            official.
          </div>
        )}

        {request.status === 'borrowed' && (
          <div className='bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800'>
            Enjoy your outfit! The lender will mark it returned once you hand it
            back.
          </div>
        )}

        {(request.status === 'rejected' || request.status === 'cancelled') && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800'>
            {request.status === 'rejected'
              ? 'Unfortunately, this request was declined. You can explore other outfits.'
              : 'This request was cancelled.'}
          </div>
        )}

        {request.status === 'returned' && !canRate && (
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800'>
            This outfit has been returned. Thank you for using Career Closet!
          </div>
        )}

        {/* Actions */}
        {(canCancel || canAcceptAgreement || canRate) && (
          <div className='flex gap-3 pt-1'>
            {canAcceptAgreement && (
              <Button
                className='flex-1 bg-app-primary/90 hover:bg-app-primary'
                onClick={() => onAcceptAgreement?.(request.id)}
              >
                <LuHandshake className='mr-2 size-4' />
                Accept Agreement
              </Button>
            )}
            {canRate && (
              <Button
                className='flex-1 bg-amber-500 hover:bg-amber-600 text-white'
                onClick={() => onRate?.(request)}
              >
                <LuStar className='mr-2 size-4' />
                Rate Experience
              </Button>
            )}
            {canCancel && (
              <Button
                variant='outline'
                className='flex-1 hover:text-destructive hover:bg-destructive/10'
                onClick={() => onCancel?.(request.id)}
              >
                <LuX className='mr-2 size-4' />
                Cancel Request
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestCard;
