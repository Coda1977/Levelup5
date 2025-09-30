import Link from 'next/link';
import { headers } from 'next/headers';

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

async function fetchJSON<T>(path: string): Promise<T> {
  const h = headers();
  const host = h.get('host')!;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed fetch ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default async function LearnPage() {
  const { data: categories } = await fetchJSON<{ data: Category[] }>(`/api/categories`);

  const chaptersByCategory = new Map<string, Chapter[]>();

  await Promise.all(
    categories.map(async (c) => {
      const { data } = await fetchJSON<{ data: Chapter[] }>(`/api/chapters?categoryId=${c.id}`);
      chaptersByCategory.set(c.id, data || []);
    })
  );

  // Fetch user's progress for all chapters
  const completedChapterIds = new Set<string>();
  try {
    const progressRes = await fetch(
      `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${headers().get('host')}/api/progress`,
      { cache: 'no-store' }
    );
    if (progressRes.ok) {
      const { data: progressData } = (await progressRes.json()) as { data: Progress[] };
      progressData.forEach((p) => completedChapterIds.add(p.chapter_id));
    }
  } catch {
    // If progress fetch fails (e.g., not authenticated), just continue without progress data
  }

  const hasAnyPublished = categories.some((c) => (chaptersByCategory.get(c.id) || []).length > 0);

  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-10">
          <h1 className="h1-hero fade-in">Learn</h1>
          <p className="text-body max-w-2xl">
            Explore published chapters grouped by category.
          </p>
        </header>

        {!hasAnyPublished ? (
          <div className="mt-16 text-center py-20">
            <div className="text-6xl font-black text-accent-yellow mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-4">No content yet</h2>
            <p className="text-body">When chapters are published, they will appear here.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-16">
            {categories.map((category) => {
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
                              <Link
                                href={`/learn/${ch.id}`}
                                className="inline-block btn-primary"
                              >
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