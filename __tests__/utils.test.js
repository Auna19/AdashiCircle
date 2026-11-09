import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateSlug,
  generateUniqueSlug,
  generateInvitationCode,
  validateNigerianPhone,
  getInitials,
} from '../src/lib/utils/index.js'
import {
  generateContributionPeriods,
  getNextDueDate,
  formatDate,
} from '../src/lib/utils/dates.js'
import { format } from 'date-fns'

describe('AdashiCircle Utility Functions', () => {
  it('generates URL-safe slugs correctly', () => {
    assert.equal(generateSlug('Lagos Market Traders Ajo'), 'lagos-market-traders-ajo')
    assert.equal(generateSlug('Tech Bros Esusu 2026!'), 'tech-bros-esusu-2026')
    assert.equal(generateSlug('  Special @# Group Name  '), 'special-group-name')
  })

  it('generates unique slugs when duplicates exist', () => {
    const existing = ['family-savings', 'family-savings-1']
    assert.equal(generateUniqueSlug('Family Savings', existing), 'family-savings-2')
  })

  it('generates valid 8-character invitation codes without ambiguous characters', () => {
    const code = generateInvitationCode()
    assert.equal(code.length, 8)
    // Should not contain 0, 1, I, O to prevent member confusion
    assert.equal(/[01IO]/.test(code), false)
  })

  it('validates Nigerian phone number formats accurately', () => {
    // Valid formats
    assert.equal(validateNigerianPhone('08012345678'), true)
    assert.equal(validateNigerianPhone('+2348012345678'), true)
    assert.equal(validateNigerianPhone('09087654321'), true)
    assert.equal(validateNigerianPhone('+234 701 234 5678'), true)

    // Invalid formats
    assert.equal(validateNigerianPhone('12345678'), false)
    assert.equal(validateNigerianPhone('+15551234567'), false)
    assert.equal(validateNigerianPhone('05012345678'), false) // invalid prefix
    assert.equal(validateNigerianPhone(''), false)
  })

  it('extracts user initials correctly', () => {
    assert.equal(getInitials('Chinedu Okafor'), 'CO')
    assert.equal(getInitials('Amina'), 'A')
    assert.equal(getInitials('Babatunde Lateef Adeleke'), 'BL')
  })
})

describe('AdashiCircle Date and Schedule Scheduling', () => {
  it('calculates next due date for different frequencies', () => {
    const base = '2026-01-01'
    const daily = getNextDueDate(base, 'daily')
    assert.equal(format(daily, 'yyyy-MM-dd'), '2026-01-02')

    const weekly = getNextDueDate(base, 'weekly')
    assert.equal(format(weekly, 'yyyy-MM-dd'), '2026-01-08')

    const monthly = getNextDueDate(base, 'monthly')
    assert.equal(format(monthly, 'yyyy-MM-dd'), '2026-02-01')
  })

  it('generates a full series of contribution periods with correct numbering', () => {
    const periods = generateContributionPeriods('2026-01-01', 'monthly', 5)
    assert.equal(periods.length, 5)
    assert.equal(periods[0].period_number, 1)
    assert.equal(periods[0].status, 'active')
    assert.equal(periods[1].period_number, 2)
    assert.equal(periods[1].status, 'upcoming')
    assert.equal(periods[4].period_number, 5)
  })
})
