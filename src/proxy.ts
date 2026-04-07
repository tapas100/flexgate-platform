import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/docs(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/v1/analyze',
  '/api/webhooks(.*)',
  '/api/health',
]);

const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isMarketingHome = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Signed-in user on homepage or auth pages → send to dashboard
  if (userId && (isAuthPage(req) || isMarketingHome(req))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Signed-out user on protected route → send to sign-in
  if (!userId && !isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
