/**
 * @file Browser-side Supabase client
 * Uses @supabase/ssr createBrowserClient so auth tokens are stored in cookies
 * (shared with Next.js server) rather than local storage.
 */

import { createBrowserClient } from '@supabase/ssr'

let client

const FALLBACK_URL = 'https://hcfqpjgiofoxqocrwqzy.supabase.co'
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZnFwamdpb2ZveHFvY3J3cXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MTQ0MTgsImV4cCI6MjEwOTI5MDQxOH0.y1H0ggfRWmaYx_dBfXerqfA4WbjiI367BCZqm7JRkQg'

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON

  try {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.error('Failed to create browser Supabase client:', err)
  }

  return client
}

export default createClient
