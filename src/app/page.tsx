import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="section-container" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container-max">
        {/* Hero Section */}
        <header className="text-center mb-16 fade-in">
          <h1 className="h1-hero mb-6">
            Master Management
            <br />
            in 5 Minutes a Day
          </h1>
          <p className="text-body max-w-2xl mx-auto mb-8">
            Bite-sized lessons. AI coaching. Real results.
          </p>
          
          {/* Primary CTA */}
          <Link
            href="/auth/signup"
            className="btn-primary text-lg px-12 py-5 mb-3"
            aria-label="Start learning for free"
          >
            Start Learning Free →
          </Link>
          <p className="text-tiny text-center">No credit card required</p>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          <div className="card-feature text-center">
            <div className="text-5xl mb-3">📚</div>
            <div className="text-3xl font-bold mb-2">50+</div>
            <p className="text-small text-text-secondary">Chapters</p>
          </div>
          <div className="card-feature text-center">
            <div className="text-5xl mb-3">🤖</div>
            <div className="text-3xl font-bold mb-2">AI</div>
            <p className="text-small text-text-secondary">Coach</p>
          </div>
          <div className="card-feature text-center">
            <div className="text-5xl mb-3">📈</div>
            <div className="text-3xl font-bold mb-2">Track</div>
            <p className="text-small text-text-secondary">Progress</p>
          </div>
        </section>

        {/* Testimonial */}
        <section className="max-w-2xl mx-auto text-center">
          <blockquote className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl">
            <p className="text-body text-text-primary mb-4 italic">
              "Promoted to Senior Manager in 3 months"
            </p>
            <footer className="text-small font-semibold">
              — Sarah K., Tech Lead
            </footer>
          </blockquote>
        </section>
      </div>
    </main>
  );
}