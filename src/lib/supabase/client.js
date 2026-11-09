/**
 * @file Browser-side Supabase client
 * Uses @supabase/ssr createBrowserClient so auth tokens are stored in cookies
 * (shared with Next.js server) rather than local storage.
 */

import { createBrowserClient } from '@supabase/ssr'

let client

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}

export default createClient

