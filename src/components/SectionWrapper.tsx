interface SectionWrapperProps {
  background?: string;
  minHeight?: string;
  className?: string;
  children: React.ReactNode;
}

export default function SectionWrapper({
  background = 'var(--bg-primary)',
  minHeight = '60vh',
  className = '',
  children,
}: SectionWrapperProps) {
  return (
    <section
      className={`flex items-center justify-center px-4 sm:px-6 ${className}`}
      style={{
        background,
        minHeight,
      }}
    >
      <div className="container-max w-full">
        {children}
      </div>
    </section>
  );
}