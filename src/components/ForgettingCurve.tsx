export default function ForgettingCurve() {
  return (
    <svg
      viewBox="0 0 600 300"
      className="w-full max-w-2xl mx-auto"
      role="img"
      aria-label="Forgetting curve showing retention dropping from 100% to 10% over one month without reinforcement"
    >
      {/* Grid lines */}
      <g stroke="#e5e7eb" strokeWidth="1" opacity="0.5">
        {/* Horizontal grid lines */}
        <line x1="60" y1="50" x2="580" y2="50" />
        <line x1="60" y1="100" x2="580" y2="100" />
        <line x1="60" y1="150" x2="580" y2="150" />
        <line x1="60" y1="200" x2="580" y2="200" />
        <line x1="60" y1="250" x2="580" y2="250" />
        
        {/* Vertical grid lines */}
        <line x1="60" y1="50" x2="60" y2="250" />
        <line x1="233" y1="50" x2="233" y2="250" />
        <line x1="407" y1="50" x2="407" y2="250" />
        <line x1="580" y1="50" x2="580" y2="250" />
      </g>

      {/* Y-axis labels (Retention %) */}
      <g fill="var(--text-secondary)" fontSize="14" fontFamily="var(--font-sans)">
        <text x="45" y="55" textAnchor="end">100%</text>
        <text x="45" y="105" textAnchor="end">75%</text>
        <text x="45" y="155" textAnchor="end">50%</text>
        <text x="45" y="205" textAnchor="end">25%</text>
        <text x="45" y="255" textAnchor="end">0%</text>
      </g>

      {/* X-axis labels (Time) */}
      <g fill="var(--text-secondary)" fontSize="14" fontFamily="var(--font-sans)">
        <text x="60" y="275" textAnchor="middle">Now</text>
        <text x="233" y="275" textAnchor="middle">24 hours</text>
        <text x="407" y="275" textAnchor="middle">1 week</text>
        <text x="570" y="275" textAnchor="middle">1 month</text>
      </g>

      {/* The forgetting curve */}
      <path
        d="M 60 50 Q 150 120, 233 190 Q 320 220, 407 230 Q 494 238, 580 240"
        fill="none"
        stroke="var(--accent-yellow)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Data points */}
      <g fill="var(--accent-yellow)">
        <circle cx="60" cy="50" r="5" />
        <circle cx="233" cy="190" r="5" />
        <circle cx="407" cy="230" r="5" />
        <circle cx="580" cy="240" r="5" />
      </g>

      {/* Annotation */}
      <text
        x="320"
        y="180"
        fill="var(--text-secondary)"
        fontSize="13"
        fontFamily="var(--font-sans)"
        fontStyle="italic"
        textAnchor="middle"
      >
        Without reinforcement
      </text>
    </svg>
  );
}