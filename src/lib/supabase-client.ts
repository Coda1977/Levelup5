import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// For use in browser environments (running in client components)
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// For use in server environments (API routes, server components) with user authentication
// Uses SSR client that can access cookies for user sessions
export function createServerSupabaseClient(request?: Request) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // For API routes, we need to handle cookies differently
          // Next.js API routes get cookies via request.cookies in newer versions
          if (request && 'cookies' in request && typeof (request as any).cookies.get === 'function') {
            // NextRequest (middleware) or newer API route format
            return (request as any).cookies.get(name)?.value;
          } else {
            // Fallback: parse from headers (for API routes)
            const cookieHeader = request?.headers?.get('cookie');
            if (!cookieHeader) return undefined;

            const cookies: Record<string, string> = {};
            cookieHeader.split(';').forEach(cookie => {
              const [namePart, value] = cookie.trim().split('=');
              if (namePart && value) {
                cookies[namePart] = decodeURIComponent(value);
              }
            });
            return cookies[name];
          }
        },
        set(name: string, value: string, options: any) {
          // Server components don't set cookies
        },
        remove(name: string, options: any) {
          // Server components don't remove cookies
        },
      },
    }
  );
}

// For use in server environments with elevated privileges (admin operations, seeding)
// Uses the service role key for elevated privileges
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}