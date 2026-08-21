import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LuCircleCheck, LuCircleX, LuHandshake, LuPackage, LuStar } from '@/utils/icons';
import GetStatusBadge from '../shared/GetStatusBade';

const RequestCard = ({
  request,
  onApprove,
  onReject,
  onConfirmLend,
  onMarkReturned,
  onRate,
}) => {
  const isPending = request.status === 'pending';
  const canConfirmLend = request.status === 'approved';
  const canMarkReturned = request.status === 'borrowed';
  const canRate =
    request.status === 'returned' && request.ratingsPending && !request.lenderRated;

  return (
    <div className='space-y-4 border-t pt-4'>
      <div className='flex items-start gap-4'>
        <Avatar size='lg'>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <p className='font-semibold'>Borrower</p>
          <p className='text-sm text-muted-foreground'>
            Requested on{' '}
            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
        <GetStatusBadge status={request.status} />
      </div>

      {/* Status Guidance */}
      {canConfirmLend && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800'>
          Confirm to proceed — the borrower will then review and accept the
          lending agreement. Chat is open in Messages.
        </div>
      )}

      {canMarkReturned && (
        <div className='bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800'>
          Outfit is on loan. Mark it as returned once you receive it back.
        </div>
      )}

      {(request.status === 'rejected' || request.status === 'cancelled') && (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600'>
          This request was {request.status}.
        </div>
      )}

      {/* Action Buttons */}
      {(isPending || canConfirmLend || canMarkReturned || canRate) && (
        <div className='flex gap-3 pt-2'>
          {isPending && (
            <>
              <Button
                variant='default'
                className='flex-1 bg-app-primary/90 hover:bg-app-primary'
                onClick={() => onApprove(request.id)}
              >
                <LuCircleCheck />
                Accept Request
              </Button>
              <Button
                variant='outline'
                className='flex-1 hover:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive'
                onClick={() => onReject(request.id)}
              >
                <LuCircleX />
                Decline
              </Button>
            </>
          )}
          {canConfirmLend && (
            <Button
              className='flex-1 bg-app-secondary hover:bg-app-secondary/90'
              onClick={() => onConfirmLend?.(request.id)}
            >
              <LuHandshake className='mr-2 size-4' />
              Confirm Lend
            </Button>
          )}
          {canMarkReturned && (
            <Button
              className='flex-1 bg-app-primary/90 hover:bg-app-primary'
              onClick={() => onMarkReturned?.(request.id)}
            >
              <LuPackage className='mr-2 size-4' />
              Mark Returned
            </Button>
          )}
          {canRate && (
            <Button
              className='flex-1 bg-amber-500 hover:bg-amber-600 text-white'
              onClick={() => onRate?.(request)}
            >
              <LuStar className='mr-2 size-4' />
              Rate Borrower
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestCard;
