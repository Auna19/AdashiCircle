/**
 * @file Financial utility functions for AdashiCircle
 * All monetary values are stored and operated on in kobo (smallest NGN unit).
 * 100 kobo = ₦1.00
 */

export function koboToNaira(kobo) {
  return (kobo || 0) / 100
}

export function nairaToKobo(naira) {
  return Math.round((naira || 0) * 100)
}

export function formatCurrency(kobo, currency = 'NGN') {
  const naira = koboToNaira(kobo)
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira)
}

export function calculateOutstandingBalance(expectedKobo, paidKobo) {
  return Math.max(0, (expectedKobo || 0) - (paidKobo || 0))
}

export function calculateContributionProgress(paidKobo, expectedKobo) {
  if (!expectedKobo || expectedKobo <= 0) return 0
  const ratio = (paidKobo || 0) / expectedKobo
  return Math.min(100, Math.round(ratio * 100))
}

export function calculateGroupTotalExpected(memberCount, amountKobo, periods) {
  return (memberCount || 0) * (amountKobo || 0) * (periods || 1)
}

export function calculatePayoutAmount(totalContributionsKobo, deductionsKobo = 0) {
  return Math.max(0, (totalContributionsKobo || 0) - (deductionsKobo || 0))
}

export function isOverdue(dueDate) {
  const due = new Date(dueDate)
  const now = new Date()
  return now.getTime() > due.getTime()
}

export function getDaysOverdue(dueDate) {
  const due = new Date(dueDate)
  const now = new Date()
  if (now <= due) return 0
  const diffMs = now.getTime() - due.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

