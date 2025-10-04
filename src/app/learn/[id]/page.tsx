import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { sanitizeHtml } from '@/lib/sanitize';
import { MarkCompleteButtonWrapper } from '@/components/MarkCompleteButton';
import AudioPlayer from '@/components/AudioPlayer';
import { createServiceSupabaseClient } from '@/lib/supabase-client';
import { createServerClient } from '@supabase/ssr';

type Params = { params: { id: string } };

type Chapter = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  is_published: boolean;
  display_order: number;
  audio_url?: string;
};

type Progress = {
  user_id: string;
  chapter_id: string;
  completed_at: string;
};

async function fetchJSON(path: string) {
  const h = headers();
  const host = h.get('host')!;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' });
  return res;
}

export default async function ChapterPage({ params }: Params) {
  // Fetch chapter detail (published only; 404 when not found)
  const detailRes = await fetchJSON(`/api/chapters/${params.id}`);
  if (detailRes.status === 404) {
    notFound();
  }
  if (!detailRes.ok) {
    throw new Error(`Failed to load chapter: ${detailRes.status}`);
  }
  const { data: chapter } = (await detailRes.json()) as { data: Chapter };

  // Fetch all published chapters to compute prev/next (sorted by display_order)
  const listRes = await fetchJSON(`/api/chapters`);
  if (!listRes.ok) {
    throw new Error(`Failed to load chapters list: ${listRes.status}`);
  }
  const { data: list } = (await listRes.json()) as { data: Chapter[] };

  // Fetch user's progress for this chapter
  let isCompleted = false;
  
  // Get authenticated user to check progress
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  
  const {
    data: { user: currentUser },
  } = await ssr.auth.getUser();

  if (currentUser) {
    const svc = createServiceSupabaseClient();
    const { data: progressData } = await svc
      .from('user_progress')
      .select('chapter_id')
      .eq('user_id', currentUser.id)
      .eq('chapter_id', params.id)
      .single();
    
    isCompleted = !!progressData;
  }

  const idx = list.findIndex((c) => c.id === chapter.id);
  const prev = idx > 0 ? list[idx - 1] : undefined;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined;

  const safeHtml = sanitizeHtml(chapter.content || '');

  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-text-secondary mb-2">
            <Link href="/learn" className="underline hover:text-text-primary transition-colors">
              ← Back to Learn
            </Link>
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{chapter.title}</h1>
          <p className="text-sm sm:text-base text-text-secondary">Chapter {chapter.display_order}</p>
        </header>

        {/* Audio Player - appears if audio is available */}
        {chapter.audio_url && (
          <AudioPlayer audioUrl={chapter.audio_url} title={chapter.title} />
        )}

        <article
          className="prose prose-sm sm:prose lg:prose-lg !max-w-none bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm"
          // Content sanitized via strict allowlist sanitizer
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        <div className="mt-6 sm:mt-8 flex justify-center">
          <MarkCompleteButtonWrapper chapterId={chapter.id} initialCompleted={isCompleted} />
        </div>

        <nav className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {prev ? (
            <Link
              href={`/learn/${prev.id}`}
              className="btn-primary text-center min-h-[48px] flex items-center justify-center"
            >
              <span className="truncate">← {prev.title}</span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next ? (
            <Link
              href={`/learn/${next.id}`}
              className="btn-primary text-center min-h-[48px] flex items-center justify-center"
            >
              <span className="truncate">{next.title} →</span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
        </nav>
      </div>
    </main>
  );
}