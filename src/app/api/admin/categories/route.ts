import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-client';

// Helper function to check admin access
async function checkAdminAccess(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, status: 401, error: 'Unauthorized' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { authorized: false, status: 403, error: 'Forbidden: Admin access required' };
  }

  return { authorized: true };
}

// POST /api/admin/categories - Create a new category
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient(request as any);
  const accessCheck = await checkAdminAccess(supabase);
  
  if (!accessCheck.authorized) {
    return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, display_order } = body;

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  // Use service role client for admin operations to bypass RLS
  const serviceSupabase = createServiceSupabaseClient();
  
  const { data, error } = await serviceSupabase
    .from('categories')
    .insert({
      title,
      display_order: display_order || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Category creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// PUT /api/admin/categories - Update an existing category
export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient(request as any);
  const accessCheck = await checkAdminAccess(supabase);
  
  if (!accessCheck.authorized) {
    return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, title, display_order } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (display_order !== undefined) updateData.display_order = display_order;

  // Use service role client for admin operations to bypass RLS
  const serviceSupabase = createServiceSupabaseClient();
  
  const { data, error } = await serviceSupabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Category update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

// DELETE /api/admin/categories - Delete a category
export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient(request as any);
  const accessCheck = await checkAdminAccess(supabase);
  
  if (!accessCheck.authorized) {
    return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Use service role client for admin operations to bypass RLS
  const serviceSupabase = createServiceSupabaseClient();
  
  const { error } = await serviceSupabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}