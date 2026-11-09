import { NextResponse } from 'next/server'

export async function GET(request) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard'

  const response = NextResponse.redirect(url)
  response.cookies.set('adashi_demo_session', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  })

  return response
}

export async function POST(request) {
  return GET(request)
}

