import Reveal from './Reveal';

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  delay?: number;
}

export default function StepCard({ number, title, description, delay = 0 }: StepCardProps) {
  return (
    <Reveal delay={delay}>
      <div className="card-feature h-full">
        <div
          className="text-5xl sm:text-6xl font-black mb-4"
          style={{ color: 'var(--accent-yellow)' }}
        >
          {number}
        </div>
        <h3 className="h3-card mb-3">{title}</h3>
        <p className="text-body">{description}</p>
      </div>
    </Reveal>
  );
}