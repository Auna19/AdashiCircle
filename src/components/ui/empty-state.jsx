import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-foreground">{title}</h3>

      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2">
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState

