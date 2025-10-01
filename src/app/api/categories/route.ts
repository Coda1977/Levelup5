import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  // Use service client to bypass RLS and get all categories
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('categories')
    .select('id, title, display_order')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}