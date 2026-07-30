import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LuCircleCheck, LuCircleX, LuMessageSquare } from '@/utils/icons';
import { Badge } from '../ui/badge';
import GetStatusBadge from '../shared/GetStatusBade';

const RequestCard = ({ request, onApprove, onReject }) => {
  const isPending = request.status === 'pending';

  return (
    <div className='space-y-4 border-t pt-4'>
      <div className='flex items-start gap-4'>
        <Avatar size='lg'>
          <AvatarImage src={request.borrowerImageUrl} />
          <AvatarFallback>{request.borrowerName?.[0] || 'B'}</AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <p className='font-semibold'>{request.borrowerName}</p>
          <p className='text-sm text-muted-foreground'>
            Requested on {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
        <GetStatusBadge status={request.status} />
      </div>
      {/* Borrower Message */}
      <div className='bg-blue-50 border border-blue-100 rounded-lg p-4'>
        <div className='flex items-start gap-2 mb-2'>
          <LuMessageSquare className='size-4 text-blue-600' />
          <span className='text-sm font-medium text-blue-900'>
            Message from borrower:
          </span>
        </div>
        <p className='text-sm text-blue-800 leading-relaxed'>
          {request.message || 'No message provided'}
        </p>
      </div>
      {/* After Approval Info */}
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-3'>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          <strong>After approval:</strong> Chat will unlock, LinkedIn profiles
          become visible to both parties, and you'll be able to coordinate
          pickup details.
        </p>
      </div>
      {/* Action Buttons */}
      {isPending && (
        <div className='flex gap-3 pt-2'>
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
        </div>
      )}
    </div>
  );
};

export default RequestCard;