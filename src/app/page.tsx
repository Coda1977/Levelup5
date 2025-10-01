import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="section-container">
      <div className="container-max">
        <header className="mb-10">
          <h1 className="h1-hero fade-in">LevelUp</h1>
          <p className="text-body max-w-2xl">
            Mobile-first management development. Bite-sized lessons. Practical coaching. Ship better leadership habits.
          </p>
        </header>

        <div className="mt-8 flex gap-4">
          <Link
            href="/auth/signup"
            className="btn-primary inline-flex items-center justify-center"
            aria-label="Sign up for LevelUp"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-white text-text-primary font-semibold rounded-xl border-2 border-accent-yellow hover:bg-gray-50 inline-flex items-center justify-center"
            aria-label="Sign in to LevelUp"
          >
            Sign In
          </Link>
        </div>

        <section className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="card-feature">
            <div className="text-6xl font-black text-accent-yellow mb-4">01</div>
            <h3 className="text-2xl font-bold mb-4">Learn fast</h3>
            <p className="text-body">Five-minute reads with embedded media. Designed for busy managers on the go.</p>
          </div>
          <div className="card-feature">
            <div className="text-6xl font-black text-accent-yellow mb-4">02</div>
            <h3 className="text-2xl font-bold mb-4">Track progress</h3>
            <p className="text-body">Simple checkmarks and an overall progress bar across all chapters.</p>
          </div>
        </section>
      </div>
    </main>
  );
}