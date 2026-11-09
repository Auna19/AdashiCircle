'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CircleDollarSign } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function AuthGuard({
  children,
  requireSuperAdmin = false,
  redirectTo = '/login',
}) {
  const router = useRouter()
  const { isLoading, isAuthenticated, isSuperAdmin } = useAuth()

  React.useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      const currentPath = window.location.pathname
      const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      router.replace(loginUrl)
      return
    }

    if (requireSuperAdmin && !isSuperAdmin) {
      router.replace('/dashboard')
    }
  }, [isLoading, isAuthenticated, requireSuperAdmin, isSuperAdmin, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center">
          <CircleDollarSign className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading your account…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return null
  }

  return <>{children}</>
}

export default AuthGuard

