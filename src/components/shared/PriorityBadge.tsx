import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SupportPriority } from '@/types'

const PRIORITY_MAP: Record<SupportPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-200 animate-pulse' },
}

interface PriorityBadgeProps {
  priority: SupportPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_MAP[priority]
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
