import * as React from 'react'
import { cn } from '@/lib/utils/cn'

const variantColors = {
  default: { stroke: '#059669', track: '#d1fae5' },
  success: { stroke: '#16a34a', track: '#bbf7d0' },
  warning: { stroke: '#d97706', track: '#fde68a' },
  danger: { stroke: '#dc2626', track: '#fecaca' },
}

export function ProgressRing({
  percentage = 0,
  size = 80,
  strokeWidth = 8,
  className,
  label,
  sublabel,
  variant = 'default',
  showPercentage = true,
  animate = true,
}) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const colors = variantColors[variant] || variantColors.default

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={
            animate
              ? { transition: 'stroke-dashoffset 0.6s ease-in-out' }
              : undefined
          }
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && !label && (
          <span
            className="font-bold tabular-nums leading-none"
            style={{ fontSize: size * 0.18, color: colors.stroke }}
          >
            {clamped}%
          </span>
        )}
        {label && (
          <>
            <span
              className="font-bold leading-none text-center"
              style={{ fontSize: size * 0.16, color: colors.stroke }}
            >
              {label}
            </span>
            {sublabel && (
              <span
                className="text-muted-foreground leading-none mt-0.5 text-center"
                style={{ fontSize: size * 0.12 }}
              >
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProgressRing

