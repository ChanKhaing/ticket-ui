import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  TicketStatus,
  OrderStatus,
  PaymentStatus,
  PurchasedTicketStatus,
  SupportStatus,
  UserStatus,
} from '@/types'

type AnyStatus =
  | TicketStatus
  | OrderStatus
  | PaymentStatus
  | PurchasedTicketStatus
  | SupportStatus
  | UserStatus

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  // Green
  active: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200' },
  published: { label: 'Published', className: 'bg-green-100 text-green-700 border-green-200' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700 border-green-200' },
  issued: { label: 'Issued', className: 'bg-green-100 text-green-700 border-green-200' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700 border-green-200' },
  success: { label: 'Success', className: 'bg-green-100 text-green-700 border-green-200' },
  completed: { label: 'Completed', className: 'bg-teal-100 text-teal-700 border-teal-200' },
  refunded: { label: 'Refunded', className: 'bg-teal-100 text-teal-700 border-teal-200' },
  // Yellow / Blue
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  open: { label: 'Open', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  // Gray
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  used: { label: 'Used', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  expired: { label: 'Expired', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  // Red
  banned: { label: 'Banned', className: 'bg-red-100 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200' },
  closed: { label: 'Closed', className: 'bg-red-100 text-red-700 border-red-200' },
  // Orange
  sold_out: { label: 'Sold Out', className: 'bg-orange-100 text-orange-700 border-orange-200' },
}

interface StatusBadgeProps {
  status: AnyStatus | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status.replace(/_/g, ' '),
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
