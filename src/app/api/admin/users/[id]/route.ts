import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-client';

// Helper function to check admin access
async function checkAdminAccess(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return { authorized: false, error: 'Forbidden - Admin access required', status: 403 };
  }

  return { authorized: true, user };
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient(request as any);
  const svc = createServiceSupabaseClient();

  // Check admin access
  const accessCheck = await checkAdminAccess(supabase);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: accessCheck.status }
    );
  }

  const userId = params.id;

  // Prevent admin from deleting themselves
  if (userId === accessCheck.user.id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    );
  }

  try {
    // Delete user using admin API
    // This will cascade delete all related data (profile, progress, conversations, messages)
    const { error: deleteError } = await svc.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}