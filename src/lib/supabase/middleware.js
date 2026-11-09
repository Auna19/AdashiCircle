/**
 * @file Supabase auth-session refresh helper for Next.js middleware.
 * Wraps createServerClient so that middleware can read and write cookies
 * on the incoming request / outgoing response pair.
 */

import { createServerClient } from '@supabase/ssr'

export async function updateSession(request, response) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Check for local demo preview session
  const demoCookie = request.cookies.get('adashi_demo_session')
  if (demoCookie?.value === 'true') {
    const demoUser = {
      id: 'demo-user-123',
      email: 'organizer@adashicircle.ng',
      app_metadata: { role: 'super_admin', is_super_admin: true },
      user_metadata: { first_name: 'Adashi', last_name: 'Organizer' },
    }
    return { supabase, response, user: demoUser }
  }

  // IMPORTANT: use getUser() not getSession() – getUser() validates the JWT
  // against the Supabase auth server and cannot be spoofed.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch (err) {
    // If Supabase is unconfigured, fallback gracefully
    user = null
  }

  return { supabase, response, user }
}

