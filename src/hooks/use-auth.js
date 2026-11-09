'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userId) => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (!error && data) {
          setProfile(data)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    },
    [supabase]
  )

  useEffect(() => {
    let mounted = true

    // Check user with getUser()
    async function initUser() {
      try {
        // Check if demo preview mode is active
        if (typeof document !== 'undefined' && document.cookie.includes('adashi_demo_session=true')) {
          if (mounted) {
            setUser({
              id: 'demo-user-123',
              email: 'organizer@adashicircle.ng',
              app_metadata: { role: 'super_admin', is_super_admin: true },
              user_metadata: { first_name: 'Adashi', last_name: 'Organizer' },
            })
            setProfile({
              id: 'demo-profile-123',
              user_id: 'demo-user-123',
              first_name: 'Adashi',
              last_name: 'Organizer',
              phone_number: '+2348012345678',
              is_super_admin: true,
            })
            setIsLoading(false)
            return
          }
        }

        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (mounted) {
          setUser(currentUser ?? null)
          if (currentUser) {
            await fetchProfile(currentUser.id)
          }
        }
      } catch (err) {
        console.error('Error getting user:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        if (mounted) {
          setUser(currentUser)
          if (currentUser) {
            await fetchProfile(currentUser.id)
          } else {
            setProfile(null)
          }
          setIsLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'adashi_demo_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
      await supabase.auth.signOut()
    } finally {
      setUser(null)
      setProfile(null)
      router.push('/login')
      router.refresh()
    }
  }, [supabase, router])

  const isSuperAdmin =
    user?.app_metadata?.role === 'super_admin' ||
    user?.app_metadata?.is_super_admin === true ||
    profile?.is_super_admin === true

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: !!isSuperAdmin,
    signOut,
  }
}

export default useAuth

