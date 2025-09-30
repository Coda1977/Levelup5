import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-client';

// GET /api/progress - Fetch user's progress
// Optional query param: chapterId (to get progress for a specific chapter)
export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
  
  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');

  let query = supabase
    .from('user_progress')
    .select('user_id, chapter_id, completed_at')
    .eq('user_id', user.id);

  if (chapterId) {
    query = query.eq('chapter_id', chapterId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

// POST /api/progress - Mark a chapter as completed
// Body: { chapterId: string }
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { chapterId } = body;

  if (!chapterId || typeof chapterId !== 'string') {
    return NextResponse.json(
      { error: 'chapterId is required and must be a string' },
      { status: 400 }
    );
  }

  // Verify chapter exists and is published
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('id, is_published')
    .eq('id', chapterId)
    .eq('is_published', true)
    .single();

  if (chapterError || !chapter) {
    return NextResponse.json(
      { error: 'Chapter not found or not published' },
      { status: 404 }
    );
  }

  // Insert or update progress (upsert)
  const { data, error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        chapter_id: chapterId,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,chapter_id',
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

// DELETE /api/progress - Remove progress for a chapter
// Body: { chapterId: string }
export async function DELETE(request: Request) {
  const supabase = createServerSupabaseClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { chapterId } = body;

  if (!chapterId || typeof chapterId !== 'string') {
    return NextResponse.json(
      { error: 'chapterId is required and must be a string' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}