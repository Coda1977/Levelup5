import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes (unauthenticated access allowed)
  const pathname = request.nextUrl.pathname;
  const isAuthPath =
    pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');
  const isPublicPath =
    pathname === '/';
  const isApiRoute = pathname.startsWith('/api');

  console.log('Middleware:', {
    pathname,
    user: user ? { id: user.id, email: user.email } : null,
    isAuthPath,
    isPublicPath,
    isApiRoute,
    willRedirect: !user && !isAuthPath && !isPublicPath && !isApiRoute
  });

  // Allow all API routes to handle their own auth
  if (isApiRoute) {
    return response;
  }

  // Require auth for non-public paths (e.g., /admin, /chat)
  if (!user && !isAuthPath && !isPublicPath) {
    console.log('Middleware: Redirecting to login from', pathname);
    const loginUrl = new URL('/auth/login', request.url);
    // Store the original destination to redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If signed in, prevent visiting auth pages
  if (user && isAuthPath) {
    // Check if there's a redirect parameter to go back to the original destination
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/learn';
    console.log('Middleware: Redirecting authenticated user from auth page to', destination);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};