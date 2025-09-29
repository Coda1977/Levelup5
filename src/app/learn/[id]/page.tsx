import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sanitizeHtml } from '@/lib/sanitize';
import { getChapterById, getPrevNextChapter } from '@/lib/mock';

type Params = { params: { id: string } };

export default function ChapterPage({ params }: Params) {
  const chapter = getChapterById(params.id);

  // Chapter must exist and be published for end users
  if (!chapter || !chapter.isPublished) {
    notFound();
  }

  const { prev, next } = getPrevNextChapter(chapter.id);
  const safeHtml = sanitizeHtml(chapter.content);

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
          <p className="text-small text-text-secondary">Order {chapter.displayOrder}</p>
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