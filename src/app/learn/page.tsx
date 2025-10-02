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
  let userName = 'there';
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();
    includeDrafts = profile?.role === 'admin';
    userName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
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

  // Fetch user's progress for all chapters
  const completedChapterIds = new Set<string>();
  if (user) {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('chapter_id, completed_at')
        .eq('user_id', user.id);
      
      if (!progressError && progressData) {
        progressData.forEach((p) => completedChapterIds.add(p.chapter_id));
      }
    } catch {
      // If progress fetch fails, continue without progress data
    }
  }

  const hasAnyPublished = (categories || []).some(
    (c) => (chaptersByCategory.get(c.id) || []).length > 0
  );

  const totalPublishedChapters = publishedChapters?.length || 0;
  const completedCount = completedChapterIds.size;
  const progressPercentage = totalPublishedChapters > 0
    ? Math.round((completedCount / totalPublishedChapters) * 100)
    : 0;

  // Find the next chapter to continue (first incomplete chapter)
  let continueChapter: Chapter | null = null;
  if (user && publishedChapters) {
    for (const ch of publishedChapters) {
      if (!completedChapterIds.has(ch.id)) {
        continueChapter = ch;
        break;
      }
    }
  }

  return (
    <main className="section-container">
      <div className="container-max">
        {/* Header with greeting */}
        <header className="mb-10 fade-in">
          <h1 className="h1-page mb-4">
            Welcome back, {userName} 👋
          </h1>
          
          {/* Progress Bar */}
          {user && totalPublishedChapters > 0 && (
            <div className="max-w-2xl">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-tiny mt-2">
                {completedCount}/{totalPublishedChapters} chapters complete ({progressPercentage}%)
              </p>
            </div>
          )}
        </header>

        {!hasAnyPublished ? (
          /* Empty State */
          <div className="mt-16 text-center py-20">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="h2-section mb-4">No content yet</h2>
            <p className="text-body mb-8">
              Content is coming soon! Check back tomorrow.
            </p>
            <Link href="/chat" className="btn-primary">
              Try our AI coach while you wait →
            </Link>
          </div>
        ) : (
          <>
            {/* Continue Learning Section */}
            {continueChapter && (
              <section className="mb-16 fade-in">
                <h2 className="h2-section mb-6">Continue Learning</h2>
                <div className="card-continue">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📖</div>
                    <div className="flex-1">
                      <h3 className="h3-card mb-2">{continueChapter.title}</h3>
                      <p className="text-small text-text-secondary mb-4">
                        5 min read • Chapter {continueChapter.display_order}
                      </p>
                      <Link href={`/learn/${continueChapter.id}`} className="btn-primary">
                        Continue →
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Category Sections */}
            <div className="space-y-16">
              {(categories || []).map((category) => {
                const items = chaptersByCategory.get(category.id) || [];
                if (!items.length) return null;
                
                const categoryCompleted = items.filter(ch => completedChapterIds.has(ch.id)).length;
                const categoryTotal = items.length;
                
                return (
                  <section key={category.id}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="h2-section">{category.title}</h2>
                      <span className="text-small text-text-secondary">
                        {categoryCompleted}/{categoryTotal}
                      </span>
                    </div>
                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((ch) => {
                        const isCompleted = completedChapterIds.has(ch.id);
                        return (
                          <li key={ch.id} className="card-feature relative group">
                            {/* Completion Badge */}
                            {isCompleted && (
                              <div className="badge-complete absolute top-4 right-4">
                                ✓
                              </div>
                            )}
                            
                            <div className="flex flex-col h-full">
                              <h3 className="h3-card mb-2">{ch.title}</h3>
                              <p className="text-tiny mb-6">
                                5 min • Ch {ch.display_order}
                              </p>
                              <div className="mt-auto">
                                <Link 
                                  href={`/learn/${ch.id}`} 
                                  className="btn-primary w-full text-center"
                                >
                                  {isCompleted ? 'Review' : 'Start'}
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
          </>
        )}
      </div>
    </main>
  );
}