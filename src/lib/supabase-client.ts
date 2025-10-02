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
// Supports both API routes (with request parameter) and server components (without parameter)
export async function createServerSupabaseClient(request?: Request) {
  // If called with a request (API route), use the API version
  if (request) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Parse from headers for API routes
            const cookieHeader = request.headers.get('cookie');
            if (!cookieHeader) return undefined;

            const cookies: Record<string, string> = {};
            cookieHeader.split(';').forEach(cookie => {
              const [namePart, value] = cookie.trim().split('=');
              if (namePart && value) {
                cookies[namePart] = decodeURIComponent(value);
              }
            });
            return cookies[name];
          },
          set(name: string, value: string, options: any) {
            // API routes handle cookie setting via response headers
          },
          remove(name: string, options: any) {
            // API routes handle cookie removal via response headers
          },
        },
      }
    );
  }
  
  // If called without request (server component), use cookies()
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server components can't set cookies during render
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', options);
          } catch {
            // Server components can't remove cookies during render
          }
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