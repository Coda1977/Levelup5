import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-client';
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
  const supabase = createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return (
      <main className="section-container">
        <div className="container-max">
          <div className="text-center py-20">
            <div className="text-6xl font-black text-red-500 mb-4">🚫</div>
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-body">You do not have permission to access the admin panel.</p>
          </div>
        </div>
      </main>
    );
  }

  // Fetch categories and chapters
  const { data: categories } = await fetchJSON<{ data: Category[] }>(`/api/categories`);
  
  // Fetch ALL chapters (including unpublished) for admin
  const allChaptersRes = await fetch(
    `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${headers().get('host')}/api/chapters`,
    { cache: 'no-store' }
  );
  
  let allChapters: Chapter[] = [];
  if (allChaptersRes.ok) {
    const { data } = await allChaptersRes.json();
    allChapters = data || [];
  }

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