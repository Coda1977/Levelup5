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

export async function GET(request: Request) {
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

  try {
    // Get total published chapters count
    const { count: totalChapters } = await svc
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Fetch all users from auth.users
    const { data: authUsers, error: authError } = await svc.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching users:', authError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get user profiles and progress for each user
    const usersWithProgress = await Promise.all(
      authUsers.users.map(async (authUser) => {
        // Get user profile
        const { data: profile } = await svc
          .from('user_profiles')
          .select('role')
          .eq('id', authUser.id)
          .single();

        // Get user's completed chapters
        const { data: progress } = await svc
          .from('user_progress')
          .select('chapter_id, completed_at')
          .eq('user_id', authUser.id);

        const completedChapters = progress?.length || 0;
        const progressPercentage = totalChapters && totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0;

        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          role: profile?.role || 'user',
          completed_chapters: completedChapters,
          total_chapters: totalChapters || 0,
          progress_percentage: progressPercentage,
          recent_completions: progress?.slice(0, 5) || [],
        };
      })
    );

    // Calculate statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeUsers = usersWithProgress.filter(u => 
      u.last_sign_in_at && new Date(u.last_sign_in_at) > sevenDaysAgo
    ).length;

    const avgProgress = usersWithProgress.length > 0
      ? Math.round(
          usersWithProgress.reduce((sum, u) => sum + u.progress_percentage, 0) / usersWithProgress.length
        )
      : 0;

    return NextResponse.json({
      users: usersWithProgress,
      stats: {
        total_users: usersWithProgress.length,
        active_users: activeUsers,
        average_progress: avgProgress,
        total_chapters: totalChapters || 0,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}