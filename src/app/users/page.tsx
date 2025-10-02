import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-client';
import UserDashboard from '@/components/UserDashboard';

export default async function UsersPage() {
  const supabase = await createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    redirect('/learn');
  }

  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-10">
          <h1 className="h1-hero fade-in">User Management</h1>
          <p className="text-body max-w-2xl">
            View and manage all users, track their progress, and analyze learning patterns.
          </p>
        </header>

        <UserDashboard />
      </div>
    </main>
  );
}