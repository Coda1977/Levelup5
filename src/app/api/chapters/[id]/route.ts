import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-client';

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  // Use service client to bypass RLS
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('chapters')
    .select('id, category_id, title, content, is_published, display_order, audio_url')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error) {
    // If it's just "no rows" return 404; otherwise 500
    if (String(error.message || '').toLowerCase().includes('no rows')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Chapter fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data }, { status: 200 });
}