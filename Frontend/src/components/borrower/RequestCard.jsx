import GetStatusBadge from '../shared/GetStatusBade';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LuMessageSquare, LuX } from '@/utils/icons';
import { Button } from '../ui/button';

const RequestCard = ({ request, onCancel }) => {
  const outfit = request.outfit || {};

  const isCancellable = ['pending', 'approved'].includes(request.status);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-4'>
          <img
            src={outfit.outfitImageUrl || outfit.imageUrl}
            alt={outfit.title}
            className='w-20 h-20 object-cover rounded-lg'
          />

          <div className='flex-1'>
            <CardTitle className='font-serif text-app-primary text-lg'>{outfit.title}</CardTitle>
            <CardDescription>{outfit.category}</CardDescription>
          </div>

          <GetStatusBadge status={request.status} />
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Lender Info */}
        <div className='flex items-center gap-4'>
          <Avatar>
            <AvatarImage src={outfit.lenderDetails?.lenderImageUrl} />
            <AvatarFallback>{outfit.lenderDetails?.lenderName?.[0] || 'L'}</AvatarFallback>
          </Avatar>

          <div>
            <p className='font-semibold'>{outfit.lenderDetails?.lenderName || 'Lender'}</p>
            <p className='text-sm text-muted-foreground'>Lender</p>
          </div>
        </div>

        {/* Request Info */}
        <div className='text-sm text-muted-foreground'>
          <p>Requested on: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}</p>
        </div>

        {/* Message */}
        <div className='bg-blue-50 border border-blue-100 rounded-lg p-4'>
          <div className='flex items-start gap-2 mb-2'>
            <LuMessageSquare className='size-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-900'>Your Message:</span>
          </div>
          <p className='text-sm text-blue-800 leading-relaxed'>{request.message || 'No message'}</p>
        </div>

        {/* Contextual Info */}
        {request.status === 'approved' && (
          <div className='bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800'>
            🎉 Your request has been approved! You can now coordinate pickup and chat with the lender.
          </div>
        )}

        {request.status === 'rejected' && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800'>
            Unfortunately, this request was declined. You can explore other outfits.
          </div>
        )}

        {request.status === 'returned' && (
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800'>
            This outfit has been returned. Thank you for using Career Closet!
          </div>
        )}

        {/* Cancel Button for pending/approved requests */}
        {isCancellable && (
          <Button
            variant='outline'
            className='w-full hover:text-destructive hover:bg-destructive/10'
            onClick={() => onCancel?.(request.id)}
          >
            <LuX className='mr-2 size-4' />
            Cancel Request
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestCard;