import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()

    const { sessionClaims } = await auth()
    const role = (sessionClaims?.metadata as any)?.role
    
    const isAuthCallback = req.nextUrl.pathname.startsWith('/api/auth')
    const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding')

    if (!role && !isOnboarding && !isAuthCallback) {
      const onboardingUrl = new URL('/onboarding', req.url)
      return Response.redirect(onboardingUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
