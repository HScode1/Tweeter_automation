import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Définition des routes protégées
const isProtectedRoute = createRouteMatcher([
  '/accounts',
  '/dashboard',
  '/pricing',
  '/schedule',
  '/studio',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session || !session.userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/accounts',
    '/dashboard',
    '/pricing',
    '/schedule',
    '/studio',
    '/api(.*)',
  ],
};
