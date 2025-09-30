import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { sanitizeHtml } from '@/lib/sanitize';

type Params = { params: { id: string } };

type Chapter = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  is_published: boolean;
  display_order: number;
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

  const idx = list.findIndex((c) => c.id === chapter.id);
  const prev = idx > 0 ? list[idx - 1] : undefined;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined;

  const safeHtml = sanitizeHtml(chapter.content || '');

  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-8">
          <p className="text-small text-text-secondary mb-2">
            <Link href="/learn" className="underline">
              ← Back to Learn
            </Link>
          </p>
          <h1 className="h2-section">{chapter.title}</h1>
          <p className="text-small text-text-secondary">Order {chapter.display_order}</p>
        </header>

        <article
          className="prose max-w-none bg-white rounded-2xl p-6 sm:p-8 shadow-sm"
          // Content sanitized via strict allowlist sanitizer
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        <nav className="mt-10 flex items-center justify-between gap-4">
          {prev ? (
            <Link href={`/learn/${prev.id}`} className="btn-primary">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/learn/${next.id}`} className="btn-primary">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </main>
  );
}