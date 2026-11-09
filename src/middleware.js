/**
 * @file Next.js Edge Middleware (JavaScript)
 * - Refreshes the Supabase auth session on every request
 * - Guards protected route segments (/dashboard, /groups, /admin, /profile)
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated users away from auth pages (/login, /register, etc.)
 * - Handles super-admin routes (/admin/*)
 */

import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_PREFIXES = ['/dashboard', '/groups', '/profile', '/admin']
const SUPER_ADMIN_PREFIXES = ['/admin']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/login', '/auth/register']

function matchesAny(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Build a base response
  let response = NextResponse.next({ request })

  // Refresh Supabase session and get the current user securely using getUser()
  const { response: refreshedResponse, user } = await updateSession(
    request,
    response
  )
  response = refreshedResponse

  const isAuthenticated = user !== null

  // 1. Redirect authenticated users away from login/register pages
  if (isAuthenticated && matchesAny(pathname, AUTH_ROUTES)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Guard protected routes for unauthenticated users
  if (!isAuthenticated && matchesAny(pathname, PROTECTED_PREFIXES)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Guard super-admin routes
  if (isAuthenticated && matchesAny(pathname, SUPER_ADMIN_PREFIXES)) {
    const isSuperAdmin =
      user?.app_metadata?.role === 'super_admin' ||
      user?.app_metadata?.is_super_admin === true

    if (!isSuperAdmin) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static, _next/image, favicon.ico
     * - public assets (.svg, .png, .jpg, .ico, etc.)
     * - api routes outside of auth
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/webhooks|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff2?)$).*)',
  ],
}

