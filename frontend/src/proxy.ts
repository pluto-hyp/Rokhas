import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { sessionClaims } = await auth()
    
    const role = (sessionClaims?.metadata as any)?.role

    if (!role && !req.nextUrl.pathname.startsWith('/onboarding')) {
      const onboardingUrl = new URL('/onboarding', req.url)
      return Response.redirect(onboardingUrl)
    }

    await auth.protect()
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
