import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-client';

// POST /api/admin/dev/publish_all
// Admin-only: bulk publish all draft chapters (is_published=false)
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const svc = createServiceSupabaseClient();

  // Authn
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Authz: must be admin
  const { data: profile, error: profileError } = await svc
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // Bulk publish drafts
  const { data, error } = await svc
    .from('chapters')
    .update({ is_published: true })
    .eq('is_published', false)
    .select('id, title');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      updated: data?.length ?? 0,
      chapters: data ?? [],
    },
    { status: 200 }
  );
}