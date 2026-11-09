/**
 * @file Date utility functions for AdashiCircle
 */

import {
  format,
  formatDistanceToNow,
  addDays,
  addWeeks,
  addMonths,
  isPast,
  parseISO,
} from 'date-fns'

function toDate(date) {
  return typeof date === 'string' ? parseISO(date) : new Date(date)
}

export function getNextDueDate(lastDueDate, frequency, customDays) {
  const base = toDate(lastDueDate)
  switch (frequency) {
    case 'daily':
      return addDays(base, 1)
    case 'weekly':
      return addWeeks(base, 1)
    case 'biweekly':
      return addWeeks(base, 2)
    case 'monthly':
      return addMonths(base, 1)
    case 'custom':
      return addDays(base, customDays || 30)
    default:
      return addMonths(base, 1)
  }
}

export function generateContributionPeriods(startDate, frequency, totalCycles, customDays) {
  const periods = []
  let current = toDate(startDate)

  for (let cycle = 1; cycle <= totalCycles; cycle++) {
    const periodStart = new Date(current)
    const periodEnd = getNextDueDate(current, frequency, customDays)

    periods.push({
      period_number: cycle,
      start_date: format(periodStart, 'yyyy-MM-dd'),
      end_date: format(periodEnd, 'yyyy-MM-dd'),
      due_date: format(periodEnd, 'yyyy-MM-dd'),
      status: cycle === 1 ? 'active' : 'upcoming',
    })

    current = periodEnd
  }

  return periods
}

export function formatDate(date) {
  if (!date) return ''
  return format(toDate(date), 'dd MMM yyyy')
}

export function formatDateLong(date) {
  if (!date) return ''
  return format(toDate(date), 'MMMM do, yyyy')
}

export function formatRelativeDate(date) {
  if (!date) return ''
  return formatDistanceToNow(toDate(date), { addSuffix: true })
}

export function isDateInPast(date) {
  if (!date) return false
  return isPast(toDate(date))
}

