import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  koboToNaira,
  nairaToKobo,
  formatCurrency,
  calculateOutstandingBalance,
  calculateContributionProgress,
  calculateGroupTotalExpected,
  calculatePayoutAmount,
  isOverdue,
  getDaysOverdue,
} from '../src/lib/utils/financial.js'

describe('AdashiCircle Financial Calculations', () => {
  it('converts kobo to naira accurately without floating point errors', () => {
    assert.equal(koboToNaira(100), 1)
    assert.equal(koboToNaira(500000), 5000)
    assert.equal(koboToNaira(125050), 1250.5)
    assert.equal(koboToNaira(0), 0)
  })

  it('converts naira to kobo with proper rounding', () => {
    assert.equal(nairaToKobo(1), 100)
    assert.equal(nairaToKobo(5000), 500000)
    assert.equal(nairaToKobo(1250.5), 125050)
  })

  it('formats currency with Nigerian Naira symbol or code', () => {
    const formatted = formatCurrency(500000) // ₦5,000.00
    assert.ok(formatted.includes('5,000.00'))
  })

  it('calculates outstanding balances correctly', () => {
    // Expected ₦10,000 (1,000,000 kobo), Paid ₦6,000 (600,000 kobo)
    assert.equal(calculateOutstandingBalance(1000000, 600000), 400000)

    // Expected ₦10,000, Paid ₦10,000 -> 0 outstanding
    assert.equal(calculateOutstandingBalance(1000000, 1000000), 0)

    // Overpaid or advance payment -> never negative
    assert.equal(calculateOutstandingBalance(1000000, 1200000), 0)
  })

  it('calculates contribution progress percentage', () => {
    assert.equal(calculateContributionProgress(500000, 1000000), 50)
    assert.equal(calculateContributionProgress(1000000, 1000000), 100)
    assert.equal(calculateContributionProgress(0, 1000000), 0)
    assert.equal(calculateContributionProgress(1500000, 1000000), 100) // capped at 100%
  })

  it('calculates group total expected contributions', () => {
    // 10 members, ₦10,000 (1,000,000 kobo) each, 12 monthly periods
    const total = calculateGroupTotalExpected(10, 1000000, 12)
    assert.equal(total, 120000000) // 120,000,000 kobo = ₦1,200,000
  })

  it('calculates rotational payout amounts with optional deductions', () => {
    // Pool of ₦100,000 (10,000,000 kobo), ₦2,000 cooperative fee deduction
    const payout = calculatePayoutAmount(10000000, 200000)
    assert.equal(payout, 9800000) // ₦98,000

    // No deductions
    assert.equal(calculatePayoutAmount(10000000), 10000000)
  })

  it('detects overdue payments accurately', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    assert.equal(isOverdue(yesterday), true)
    assert.equal(isOverdue(tomorrow), false)
  })

  it('calculates days overdue', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 1000).toISOString()
    assert.ok(getDaysOverdue(twoDaysAgo) >= 2)
  })
})
