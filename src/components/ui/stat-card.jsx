import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Card, CardContent } from '@/components/ui/card'

const variantConfig = {
  default: {
    card: 'border-border',
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
  },
  success: {
    card: 'border-green-200 dark:border-green-800',
    icon: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
    value: 'text-green-700 dark:text-green-400',
  },
  warning: {
    card: 'border-amber-200 dark:border-amber-800',
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-400',
  },
  danger: {
    card: 'border-red-200 dark:border-red-800',
    icon: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
    value: 'text-red-700 dark:text-red-400',
  },
  info: {
    card: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    value: 'text-blue-700 dark:text-blue-400',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  isLoading = false,
  className,
}) {
  const config = variantConfig[variant] || variantConfig.default

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', config.card, className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={cn('text-2xl font-bold tracking-tight', config.value)}>
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', config.icon)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard

