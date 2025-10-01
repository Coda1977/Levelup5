import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const svc = createServiceSupabaseClient();

    const urlPrefix = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').slice(0, 36);
    const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 10);

    const { count: categoriesCount, error: catCountErr } = await svc
      .from('categories')
      .select('*', { count: 'exact', head: true });

    const { count: chaptersCount, error: chCountErr } = await svc
      .from('chapters')
      .select('*', { count: 'exact', head: true });

    const { data: categories, error: catErr } = await svc
      .from('categories')
      .select('id, title, display_order')
      .order('display_order', { ascending: true })
      .limit(10);

    const { data: chapters, error: chErr } = await svc
      .from('chapters')
      .select('id, title, is_published, category_id, display_order')
      .order('display_order', { ascending: true })
      .limit(20);

    // Build mapped category_id set found in chapters
    const chapterCategoryIds = Array.from(
      new Set((chapters || []).map((c) => c.category_id))
    );

    return NextResponse.json(
      {
        env: {
          supabaseUrlPrefix: urlPrefix,
          serviceKeyPresent: hasServiceKey,
        },
        counts: {
          categories: categoriesCount ?? null,
          chapters: chaptersCount ?? null,
        },
        sample: {
          categories: categories || [],
          chapters: chapters || [],
          chapterCategoryIds,
        },
        errors: {
          categoriesCount: catCountErr?.message || null,
          chaptersCount: chCountErr?.message || null,
          categories: catErr?.message || null,
          chapters: chErr?.message || null,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Admin debug failed' },
      { status: 500 }
    );
  }
}