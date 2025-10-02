'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function ScrollStory() {
  const [activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Intersection Observer for mobile/accessibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="scroll-story-container">
      {/* Section 1: No more "What was that tool again?" */}
      <section
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="scroll-section"
      >
        <div className="scroll-content fade-in">
          <h1 className="text-6xl md:text-7xl font-black mb-8 text-text-primary">
            No more{' '}
            <span className="text-accent-yellow">
              "What was that tool again?"
            </span>
          </h1>
        </div>
      </section>

      {/* Section 2: You've completed the training */}
      <section
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="scroll-section"
      >
        <div className="scroll-content fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-text-secondary">
            You've completed the training.
          </h2>
        </div>
      </section>

      {/* Section 3: Now make it stick */}
      <section
        ref={(el) => { sectionsRef.current[2] = el; }}
        className="scroll-section"
      >
        <div className="scroll-content fade-in">
          <h2 className="text-6xl md:text-7xl font-black text-text-primary mb-12">
            Now make it stick.
          </h2>
        </div>
      </section>

      {/* Section 4: CTA + Features */}
      <section
        ref={(el) => { sectionsRef.current[3] = el; }}
        className="scroll-section"
      >
        <div className="scroll-content fade-in max-w-5xl mx-auto px-6">
          {/* CTA */}
          <div className="text-center mb-16">
            <Link
              href="/auth/signup"
              className="btn-primary text-2xl px-16 py-6 inline-block"
              aria-label="Get started with LevelUp"
            >
              Let's Go
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-feature">
              <div className="text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>
                01
              </div>
              <h3 className="h3-card mb-3">Learn on the Go</h3>
              <p className="text-body">
                5-minute lessons with videos and podcasts for busy schedules.
              </p>
            </div>

            <div className="card-feature">
              <div className="text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>
                02
              </div>
              <h3 className="h3-card mb-3">Personalized Guidance</h3>
              <p className="text-body">
                Chat with an AI mentor to tackle real situations.
              </p>
            </div>

            <div className="card-feature">
              <div className="text-5xl font-black mb-4" style={{ color: 'var(--accent-yellow)' }}>
                03
              </div>
              <h3 className="h3-card mb-3">Dive Deep</h3>
              <p className="text-body">
                Long-form summaries of the greatest management books.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Quote Ribbon */}
      <section
        ref={(el) => { sectionsRef.current[4] = el; }}
        className="scroll-section"
        style={{ background: 'var(--accent-blue)' }}
      >
        <div className="scroll-content">
          <blockquote
            className="text-3xl md:text-4xl font-semibold italic max-w-4xl mx-auto px-6"
            style={{ color: 'var(--accent-yellow)' }}
          >
            "Action may not always bring happiness, but there is no happiness without action"
          </blockquote>
        </div>
      </section>
    </main>
  );
}