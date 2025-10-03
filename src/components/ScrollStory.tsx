'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function ScrollStory() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0]));
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sectionsRef.current.indexOf(entry.target as HTMLElement);
          if (index !== -1) {
            setVisibleSections((prev) => {
              const newSet = new Set(prev);
              if (entry.isIntersecting) {
                newSet.add(index);
              }
              return newSet;
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-bg-primary">
      {/* Section 1: Hero with Value Prop */}
      <section
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-20 bg-gradient-to-b from-bg-primary to-white"
      >
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
          visibleSections.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="h1-hero mb-6">
            Transforming Insight
            <br />
            into Action
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-text-secondary mb-8 max-w-3xl mx-auto font-medium">
            5-minute management lessons. Learn on your commute, remember in your meetings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 min-h-[56px] w-full sm:w-auto"
            >
              Start Your First Lesson Free →
            </Link>
            <Link
              href="/learn"
              className="btn-secondary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 min-h-[56px] w-full sm:w-auto"
            >
              Explore Lessons
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Problem Statement */}
      <section
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 bg-white"
      >
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 delay-100 ${
          visibleSections.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 text-text-primary leading-tight">
            No more{' '}
            <span className="text-accent-yellow">
              "What was that framework again?"
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
            You've been to the training. You've read the books. But when you need it most, the details slip away.
          </p>
        </div>
      </section>

      {/* Section 3: The Gap */}
      <section
        ref={(el) => { sectionsRef.current[2] = el; }}
        className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-b from-white to-bg-primary"
      >
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 delay-200 ${
          visibleSections.has(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-secondary mb-6">
            You've completed the training.
          </h2>
          <p className="text-xl sm:text-2xl text-text-primary font-semibold">
            Now make it stick.
          </p>
        </div>
      </section>

      {/* Section 4: Solution */}
      <section
        ref={(el) => { sectionsRef.current[3] = el; }}
        className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 bg-bg-primary"
      >
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 delay-300 ${
          visibleSections.has(3) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-text-primary mb-8 sm:mb-12">
            Make it stick.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10">
            Bite-sized lessons, AI coaching, and deep dives into the best management books—all designed to help you remember and apply what matters.
          </p>
        </div>
      </section>

      {/* Section 5: Features + CTA */}
      <section
        ref={(el) => { sectionsRef.current[4] = el; }}
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20 bg-white"
      >
        <div className={`max-w-6xl mx-auto transition-all duration-1000 delay-400 ${
          visibleSections.has(4) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="card-feature transform transition-all duration-500 hover:scale-105">
              <div className="text-4xl sm:text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>
                01
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">Learn on the Go</h3>
              <p className="text-base sm:text-lg text-text-secondary">
                5-minute lessons with videos and podcasts for busy schedules.
              </p>
            </div>

            <div className="card-feature transform transition-all duration-500 hover:scale-105 delay-100">
              <div className="text-4xl sm:text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>
                02
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">Personalized Guidance</h3>
              <p className="text-base sm:text-lg text-text-secondary">
                Chat with an AI mentor to tackle real situations.
              </p>
            </div>

            <div className="card-feature transform transition-all duration-500 hover:scale-105 delay-200">
              <div className="text-4xl sm:text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>
                03
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">Dive Deep</h3>
              <p className="text-base sm:text-lg text-text-secondary">
                Long-form summaries of the greatest management books.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/auth/signup"
              className="btn-primary text-xl sm:text-2xl px-12 sm:px-16 py-5 sm:py-6 inline-block min-h-[64px] shadow-xl hover:shadow-2xl"
              aria-label="Get started with LevelUp"
            >
              Start Learning Free →
            </Link>
            <p className="mt-4 text-sm sm:text-base text-text-secondary">
              No credit card required • 5-minute setup
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Quote Ribbon */}
      <section
        ref={(el) => { sectionsRef.current[5] = el; }}
        className="min-h-[50vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20"
        style={{ background: 'var(--accent-blue)' }}
      >
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 delay-500 ${
          visibleSections.has(5) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <blockquote
            className="text-2xl sm:text-3xl md:text-4xl font-semibold italic"
            style={{ color: 'var(--accent-yellow)' }}
          >
            "Action may not always bring happiness, but there is no happiness without action"
          </blockquote>
          <p className="mt-6 text-lg sm:text-xl" style={{ color: 'var(--accent-yellow)', opacity: 0.8 }}>
            — Benjamin Disraeli
          </p>
        </div>
      </section>
    </main>
  );
}