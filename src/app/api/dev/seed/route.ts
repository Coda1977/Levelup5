import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-client';

// Dev-only seeding endpoint to populate minimal demo data
export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createServerSupabaseClient();

  // Helper to find or create a category by title
  async function ensureCategory(title: string, display_order: number) {
    const { data: existing, error: selErr } = await supabase
      .from('categories')
      .select('id')
      .eq('title', title)
      .limit(1);

    if (selErr) throw selErr;
    if (existing && existing.length > 0) return existing[0].id as string;

    const { data: inserted, error: insErr } = await supabase
      .from('categories')
      .insert({ title, display_order })
      .select('id')
      .single();

    if (insErr) throw insErr;
    return inserted!.id as string;
  }

  // Helper to find or create a chapter by title
  async function ensureChapter(args: {
    title: string;
    category_id: string;
    content: string;
    display_order: number;
    is_published?: boolean;
  }) {
    const { title, category_id } = args;
    const { data: existing, error: selErr } = await supabase
      .from('chapters')
      .select('id')
      .eq('title', title)
      .eq('category_id', category_id)
      .limit(1);

    if (selErr) throw selErr;
    if (existing && existing.length > 0) return existing[0].id as string;

    const { data: inserted, error: insErr } = await supabase
      .from('chapters')
      .insert({
        title: args.title,
        category_id: args.category_id,
        content: args.content,
        display_order: args.display_order,
        is_published: args.is_published ?? true,
      })
      .select('id')
      .single();

    if (insErr) throw insErr;
    return inserted!.id as string;
  }

  try {
    const foundationsId = await ensureCategory('Foundations', 1);
    const communicationId = await ensureCategory('Communication', 2);

    const ch1Id = await ensureChapter({
      title: 'What Is Good Management?',
      category_id: foundationsId,
      display_order: 1,
      content: `
        <h2>What Is Good Management?</h2>
        <p>Good management is about outcomes, clarity, and empathy. It aligns people and systems to produce results sustainably.</p>
        <ul>
          <li>Set clear expectations</li>
          <li>Provide consistent feedback</li>
          <li>Invest in growth</li>
        </ul>
      `,
      is_published: true,
    });

    const ch2Id = await ensureChapter({
      title: 'Setting Goals That Stick',
      category_id: foundationsId,
      display_order: 2,
      content: `
        <h2>Setting Goals That Stick</h2>
        <p>Use the 3C model: Clear, Connected, and Checkable.</p>
        <ol>
          <li>Clear: precise outcome & constraints</li>
          <li>Connected: tied to team & company goals</li>
          <li>Checkable: observable acceptance criteria</li>
        </ol>
      `,
      is_published: true,
    });

    return NextResponse.json(
      {
        ok: true,
        categories: { foundationsId, communicationId },
        chapters: { ch1Id, ch2Id },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Seed failed' },
      { status: 500 }
    );
  }
}