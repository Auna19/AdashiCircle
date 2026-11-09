import * as React from 'react'
import { cn } from '@/lib/utils/cn'

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl font-bold',
}

const symbolSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
}

export function formatKoboToNaira(amountKobo) {
  const naira = (amountKobo || 0) / 100
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira)
}

export function CurrencyDisplay({
  amountKobo = 0,
  currency = '₦',
  size = 'md',
  showSign = false,
  className,
}) {
  const nairaAmount = amountKobo / 100
  const isNegative = nairaAmount < 0
  const absAmount = Math.abs(nairaAmount)

  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount)

  const [whole, decimal] = formatted.split('.')
  const signPrefix = showSign ? (isNegative ? '−' : '+') : isNegative ? '−' : ''

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-0.5 tabular-nums',
        sizeClasses[size],
        isNegative ? 'text-red-600 dark:text-red-400' : undefined,
        className
      )}
    >
      {signPrefix && (
        <span className={cn('font-medium', symbolSizeClasses[size])}>{signPrefix}</span>
      )}
      <span className={cn('font-medium', symbolSizeClasses[size])}>{currency}</span>
      <span className="font-semibold">{whole}</span>
      <span className={cn('text-muted-foreground', symbolSizeClasses[size])}>
        .{decimal}
      </span>
    </span>
  )
}

export function InlineCurrency({ amountKobo }) {
  return <span className="tabular-nums">₦{formatKoboToNaira(amountKobo)}</span>
}

export default CurrencyDisplay

