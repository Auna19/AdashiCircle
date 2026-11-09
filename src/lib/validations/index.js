/**
 * @file Zod validation schemas for all AdashiCircle form inputs and API payloads.
 */

import { z } from 'zod'

const nigerianPhoneSchema = z
  .string()
  .regex(
    /^(\+?234|0)(7[0-9]|8[0-1]|9[0-1])[0-9]{8}$/,
    'Enter a valid Nigerian phone number (e.g. 08012345678)'
  )
  .optional()

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: nigerianPhoneSchema,
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

const contributionFrequencyEnum = z.enum([
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'custom',
])

export const createGroupSchema = z
  .object({
    name: z.string().min(3, 'Group name must be at least 3 characters'),
    description: z.string().max(500).optional(),
    category: z.string().optional(),
    groupType: z.enum(['rotational', 'target', 'fixed_term']).default('rotational'),
    contributionAmountNaira: z
      .number({ invalid_type_error: 'Enter a valid amount' })
      .positive('Contribution amount must be greater than zero'),
    frequency: contributionFrequencyEnum,
    customFrequencyDays: z.number().int().min(1).max(365).optional(),
    maxMembers: z.number().int().min(2).max(200),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    firstContributionDate: z.string().min(1, 'First contribution date is required'),
    privacy: z.enum(['private', 'invite_only', 'public']).default('invite_only'),
    latePenaltyNaira: z.number().optional().default(0),
    gracePeriodDays: z.number().int().min(0).max(30).default(0),
    allowPartial: z.boolean().default(false),
    requireEvidence: z.boolean().default(false),
    rulesText: z.string().optional().default(''),
  })

export const updateGroupSchema = createGroupSchema.partial()

export const inviteMemberSchema = z
  .object({
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    phone: nigerianPhoneSchema.or(z.literal('')),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Provide at least an email address or phone number',
    path: ['email'],
  })

export const recordContributionSchema = z.object({
  groupId: z.string().uuid(),
  memberId: z.string().uuid(),
  periodId: z.string().uuid(),
  amountNaira: z.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum([
    'bank_transfer',
    'cash',
    'mobile_money',
    'paystack',
    'flutterwave',
    'other',
  ]),
  transactionReference: z.string().optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const verifyContributionSchema = z.object({
  contributionId: z.string().uuid(),
  status: z.enum(['confirmed', 'rejected']),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
})

export const createPayoutSchema = z.object({
  groupId: z.string().uuid(),
  recipientMemberId: z.string().uuid(),
  amountNaira: z.number().positive(),
  scheduledDate: z.string().min(1),
  notes: z.string().optional(),
})

export const confirmPayoutSchema = z.object({
  payoutId: z.string().uuid(),
  paymentReference: z.string().min(1, 'Payment reference is required'),
  paymentMethod: z.enum([
    'bank_transfer',
    'cash',
    'mobile_money',
    'paystack',
    'flutterwave',
    'other',
  ]),
  notes: z.string().optional(),
})

export const raiseDisputeSchema = z.object({
  groupId: z.string().uuid(),
  type: z.enum([
    'missing_contribution',
    'incorrect_amount',
    'incorrect_status',
    'incorrect_payout',
    'unauthorized_adjustment',
    'other',
  ]),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details'),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
})

export const createAnnouncementSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(3),
  content: z.string().min(10),
  isPinned: z.boolean().default(false),
})

