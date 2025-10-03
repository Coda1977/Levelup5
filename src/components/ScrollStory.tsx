'use client';

import Link from 'next/link';
import SectionWrapper from './SectionWrapper';
import Reveal from './Reveal';
import StepCard from './StepCard';
import ForgettingCurve from './ForgettingCurve';

export default function ScrollStory() {
  return (
    <main className="bg-bg-primary">
      {/* Section 1: Hero */}
      <SectionWrapper
        background="linear-gradient(135deg, var(--bg-primary) 0%, #fff9e6 100%)"
        minHeight="60vh"
        className="sm:min-h-[75vh]"
      >
        <Reveal>
          <div className="text-center py-12 sm:py-16">
            <h1 className="h1-hero mb-6">
              Transforming Insight
              <br />
              into Action
            </h1>
            <p className="text-body text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
              Bite-sized management skills, reinforced by AI, right when you need them.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 min-h-[56px]"
              aria-label="Start your first lesson free"
            >
              Start Now →
            </Link>
          </div>
        </Reveal>
      </SectionWrapper>

      {/* Section 2: The Problem */}
      <SectionWrapper
        background="var(--white)"
        minHeight="40vh"
        className="sm:min-h-[50vh]"
      >
        <Reveal delay={100}>
          <div className="text-center py-12 sm:py-16">
            <h2 className="h2-section mb-6 text-text-primary">
              You forget 70% of new information within 24 hours.
            </h2>
            <p className="text-body text-lg sm:text-xl mb-8 max-w-2xl mx-auto font-semibold text-text-primary">
              LevelUp is designed to break the curve.
            </p>
            
            {/* Forgetting Curve Graphic */}
            <div className="mt-12">
              <ForgettingCurve />
            </div>
          </div>
        </Reveal>
      </SectionWrapper>

      {/* Section 3: How LevelUp Works */}
      <SectionWrapper
        background="var(--bg-primary)"
        minHeight="60vh"
        className="sm:min-h-[70vh]"
      >
        <div className="py-12 sm:py-16">
          <Reveal delay={200}>
            <div className="text-center mb-12">
              <h2 className="h2-section mb-4 text-text-primary">How LevelUp Works</h2>
              <p className="text-body text-lg sm:text-xl">
                Three ways to make your training stick
              </p>
            </div>
          </Reveal>

          {/* Three-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <StepCard
              number="01"
              title="Learn"
              description="5-minute lessons that fit your schedule—videos, podcasts, and bite-sized content."
              delay={300}
            />
            <StepCard
              number="02"
              title="Apply"
              description="Chat with an AI coach to work through real challenges and apply what you've learned."
              delay={400}
            />
            <StepCard
              number="03"
              title="Go Deeper"
              description="Access detailed summaries and frameworks whenever you need to reference them."
              delay={500}
            />
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}