import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('rokhas_token')?.value
  const pathname = request.nextUrl.pathname

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
