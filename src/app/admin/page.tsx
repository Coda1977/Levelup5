import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createServiceSupabaseClient } from '@/lib/supabase-client';
import AdminDashboard from '@/components/AdminDashboard';

type Category = { id: string; title: string; display_order: number };
type Chapter = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  is_published: boolean;
  display_order: number;
};

async function fetchJSON<T>(path: string): Promise<T> {
  const h = headers();
  const host = h.get('host')!;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed fetch ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}


export default async function AdminPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Server components don't set cookies
        },
        remove(name: string, options: CookieOptions) {
          // Server components don't remove cookies
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log('Admin page - Auth check:', {
    user: user ? { id: user.id, email: user.email } : null,
    authError,
    willRedirect: !user || authError
  });

  if (authError || !user) {
    console.log('Redirecting to login from admin page');
    redirect('/auth/login');
  }

  // TEMPORARILY DISABLED: Check if user has admin role
  // const { data: profile, error: profileError } = await supabase
  //   .from('user_profiles')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single();

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('Admin role check:', {
    userId: user.id,
    userEmail: user.email,
    profile,
    profileError,
    hasAdminRole: profile?.role === 'admin'
  });

  if (profileError || !profile || profile.role !== 'admin') {
    console.log('Access denied for user:', user.email, 'role:', profile?.role);
    return (
      <main className="section-container">
        <div className="container-max">
          <div className="text-center py-20">
            <div className="text-6xl font-black text-red-500 mb-4">🚫</div>
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-body">You do not have permission to access the admin panel.</p>
            <p className="text-small text-text-secondary mt-4">
              Current role: {profile?.role || 'none'} | User: {user.email}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Fetch categories and ALL chapters (including unpublished) directly via service client
  const service = createServiceSupabaseClient();

  const { data: categoriesData, error: catErr } = await service
    .from('categories')
    .select('id, title, display_order')
    .order('display_order', { ascending: true });

  if (catErr) {
    throw new Error(`Failed to load categories: ${catErr.message}`);
  }

  const categories = (categoriesData ?? []) as Category[];

  const { data: chaptersData, error: chErr } = await service
    .from('chapters')
    .select('id, category_id, title, content, is_published, display_order')
    .order('display_order', { ascending: true });

  if (chErr) {
    throw new Error(`Failed to load chapters: ${chErr.message}`);
  }

  const allChapters: Chapter[] = (chaptersData ?? []) as Chapter[];

  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-10">
          <h1 className="h1-hero fade-in">Admin Dashboard</h1>
          <p className="text-body max-w-2xl">
            Manage categories and chapters for the learning platform.
          </p>
        </header>

        <AdminDashboard 
          initialCategories={categories} 
          initialChapters={allChapters}
        />
      </div>
    </main>
  );
}