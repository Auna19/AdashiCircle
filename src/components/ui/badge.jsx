import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-secondary text-secondary-foreground border border-transparent',
        confirmed:
          'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
        pending:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        overdue:
          'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
        rejected:
          'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
        upcoming:
          'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        processing:
          'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
        partially_paid:
          'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const statusVariants = {
  default: 'default',
  confirmed: 'confirmed',
  active: 'confirmed',
  completed: 'confirmed',
  resolved: 'confirmed',
  pending: 'pending',
  pending_verification: 'pending',
  overdue: 'overdue',
  rejected: 'rejected',
  failed: 'rejected',
  cancelled: 'rejected',
  upcoming: 'upcoming',
  processing: 'processing',
  partially_paid: 'partially_paid',
}

const statusDotColors = {
  default: 'bg-secondary-foreground',
  confirmed: 'bg-green-500',
  active: 'bg-green-500',
  completed: 'bg-green-500',
  resolved: 'bg-green-500',
  pending: 'bg-amber-500',
  pending_verification: 'bg-amber-500',
  overdue: 'bg-red-500',
  rejected: 'bg-red-500',
  failed: 'bg-red-500',
  cancelled: 'bg-red-500',
  upcoming: 'bg-blue-500',
  processing: 'bg-purple-500 animate-pulse',
  partially_paid: 'bg-orange-500',
}

const statusLabels = {
  default: 'Unknown',
  confirmed: 'Confirmed',
  active: 'Active',
  completed: 'Completed',
  resolved: 'Resolved',
  pending: 'Pending',
  pending_verification: 'Pending Verification',
  overdue: 'Overdue',
  rejected: 'Rejected',
  failed: 'Failed',
  cancelled: 'Cancelled',
  upcoming: 'Upcoming',
  processing: 'Processing',
  partially_paid: 'Partially Paid',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
}

export function StatusBadge({ status = 'default', showDot = true, className }) {
  const norm = String(status || 'default').toLowerCase()
  const variant = statusVariants[norm] || 'default'
  const dotColor = statusDotColors[norm] || statusDotColors.default
  const label = statusLabels[norm] || status

  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />}
      <span>{label}</span>
    </span>
  )
}

export default Badge

