import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



// Use createRouteMatcher to define protected routes more explicitly
const isProtectedRoute = createRouteMatcher([
  '/accounts',
  '/dashbord', // Note: "dashbord" is likely a typo and should be "dashboard" if you intend that route
  '/pricing',
  '/schedule',
  '/studio',
]);


export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Match all pathnames except for the ones starting with:
    // - _next (Next.js internals)
    // - static files
    { source: '/((?!_next|static|favicon.ico).*)' },
    // Match protected routes using the route matcher
    { source: '/(.*)', match: isProtectedRoute },
  ],
};