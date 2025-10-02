import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="section-container" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container-max">
        {/* Hero Section */}
        <header className="text-center mb-12 fade-in">
          <h1 className="h1-hero mb-8">
            Transforming Insight
            <br />
            into Action
          </h1>
          
          {/* Subheader Card */}
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-10 shadow-lg">
            <p className="text-h3 font-semibold mb-4">
              No more "What was that tool again?"
            </p>
            <p className="text-body mb-2">
              You've completed the training.
            </p>
            <p className="text-body font-semibold">
              Now make it stick.
            </p>
          </div>
          
          {/* Primary CTA */}
          <Link
            href="/auth/signup"
            className="btn-primary text-lg px-12 py-5 inline-block"
            aria-label="Get started with LevelUp"
          >
            Let's Go
          </Link>
        </header>

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <div className="card-feature">
            <div className="text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>01</div>
            <h3 className="h3-card mb-3">Learn on the Go</h3>
            <p className="text-body">
              5-minute lessons with videos and podcasts for busy schedules.
            </p>
          </div>
          
          <div className="card-feature">
            <div className="text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>02</div>
            <h3 className="h3-card mb-3">Personalized Guidance</h3>
            <p className="text-body">
              Chat with an AI mentor to tackle real situations.
            </p>
          </div>
          
          <div className="card-feature">
            <div className="text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>03</div>
            <h3 className="h3-card mb-3">Dive Deep</h3>
            <p className="text-body">
              Long-form summaries of the greatest management books.
            </p>
          </div>
        </section>

        {/* Quote */}
        <section className="max-w-3xl mx-auto text-center">
          <blockquote className="text-h3 font-semibold italic" style={{ color: 'var(--accent-blue)' }}>
            "Action may not always bring happiness, but there is no happiness without action"
          </blockquote>
        </section>
      </div>
    </main>
  );
}