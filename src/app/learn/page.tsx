export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { createServiceSupabaseClient } from '@/lib/supabase-client';
import { createServerClient } from '@supabase/ssr';

type Category = { id: string; title: string; display_order: number };
type Chapter = {
  id: string;
  category_id: string;
  title: string;
  is_published: boolean;
  display_order: number;
};
type Progress = {
  user_id: string;
  chapter_id: string;
  completed_at: string;
};

export default async function LearnPage() {
  const supabase = createServiceSupabaseClient();

  // Load categories
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, title, display_order')
    .order('display_order', { ascending: true });

  if (catErr) {
    throw new Error(`Failed to load categories: ${catErr.message}`);
  }

  // Determine if current user is admin; admins see drafts too
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const {
    data: { user },
  } = await ssr.auth.getUser();

  let includeDrafts = false;
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    includeDrafts = profile?.role === 'admin';
  }

  // Load chapters; admins see all, others only published
  let chapterQuery = supabase
    .from('chapters')
    .select('id, category_id, title, is_published, display_order')
    .order('display_order', { ascending: true });

  if (!includeDrafts) {
    chapterQuery = chapterQuery.eq('is_published', true);
  }

  const { data: publishedChapters, error: chErr } = await chapterQuery;

  if (chErr) {
    throw new Error(`Failed to load chapters: ${chErr.message}`);
  }

  const chaptersByCategory = new Map<string, Chapter[]>();
  for (const c of categories || []) {
    chaptersByCategory.set(c.id, []);
  }
  for (const ch of publishedChapters || []) {
    const arr = chaptersByCategory.get(ch.category_id);
    if (arr) arr.push(ch as Chapter);
  }

  // Fetch user's progress for all chapters (optional)
  const completedChapterIds = new Set<string>();
  try {
    const h = headers();
    const host = h.get('host')!;
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const progressRes = await fetch(`${protocol}://${host}/api/progress`, { cache: 'no-store' });
    if (progressRes.ok) {
      const { data: progressData } = (await progressRes.json()) as { data: Progress[] };
      (progressData || []).forEach((p) => completedChapterIds.add(p.chapter_id));
    }
  } catch {
    // If progress fetch fails (e.g., not authenticated), continue without progress data
  }

  const hasAnyPublished = (categories || []).some(
    (c) => (chaptersByCategory.get(c.id) || []).length > 0
  );

  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-10">
          <h1 className="h1-hero fade-in">Learn</h1>
          <p className="text-body max-w-2xl">Explore published chapters grouped by category.</p>
        </header>

        {!hasAnyPublished ? (
          <div className="mt-16 text-center py-20">
            <div className="text-6xl font-black text-accent-yellow mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-4">No content yet</h2>
            <p className="text-body">When chapters are published, they will appear here.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-16">
            {(categories || []).map((category) => {
              const items = chaptersByCategory.get(category.id) || [];
              if (!items.length) return null;
              return (
                <section key={category.id}>
                  <h2 className="h2-section mb-6">{category.title}</h2>
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((ch) => {
                      const isCompleted = completedChapterIds.has(ch.id);
                      return (
                        <li key={ch.id} className="card-feature relative">
                          {isCompleted && (
                            <div className="absolute top-4 right-4 bg-accent-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                              ✓
                            </div>
                          )}
                          <div className="flex flex-col h-full">
                            <h3 className="text-xl font-semibold mb-2">{ch.title}</h3>
                            <p className="text-small text-text-secondary mb-6">
                              {isCompleted ? 'Completed' : 'Published'} • Order {ch.display_order}
                            </p>
                            <div className="mt-auto">
                              <Link href={`/learn/${ch.id}`} className="inline-block btn-primary">
                                {isCompleted ? 'Review chapter' : 'Read chapter'}
                              </Link>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}