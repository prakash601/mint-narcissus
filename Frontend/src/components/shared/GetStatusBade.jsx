import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  agreement_pending: {
    label: 'Agreement Pending',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  borrowed: {
    label: 'Borrowed',
    className: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  },
  returned: {
    label: 'Returned',
    className: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
  rated: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
  rejected: {
    label: 'Declined',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
};

export default function GetStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <Badge className={`rounded-lg ${config.className}`}>{config.label}</Badge>;
}
