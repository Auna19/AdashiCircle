/**
 * @file General utility functions for AdashiCircle (JavaScript)
 */

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getNextDueDate } from './dates.js'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function generateSlug(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUniqueSlug(name, existingSlugs = []) {
  const baseSlug = generateSlug(name)
  let candidate = baseSlug
  let counter = 1
  while (existingSlugs.includes(candidate)) {
    candidate = `${baseSlug}-${counter}`
    counter++
  }
  return candidate
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text || ''
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function getInitials(name) {
  if (!name) return 'U'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function generateInvitationCode(length = 8) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function validateNigerianPhone(phone) {
  if (!phone) return false
  const clean = phone.replace(/[\s\-().]/g, '')
  return /^(\+234|0)[789][01]\d{8}$/.test(clean)
}

export function sanitizeInput(input) {
  return (input || '')
    .replace(/<[^>]*>/g, '')
    .replace(/['"`;]/g, '')
    .trim()
}

