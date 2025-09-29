// Mock data and helpers to scaffold UI before real APIs exist

export type Category = {
  id: string;
  title: string;
  displayOrder: number;
};

export type Chapter = {
  id: string;
  categoryId: string;
  title: string;
  isPublished: boolean;
  displayOrder: number;
  // HTML string (will be sanitized before rendering)
  content: string;
};

const categories: Category[] = [
  { id: "cat-foundations", title: "Foundations", displayOrder: 1 },
  { id: "cat-communication", title: "Communication", displayOrder: 2 },
];

const chapters: Chapter[] = [
  {
    id: "ch-001",
    categoryId: "cat-foundations",
    title: "What Is Good Management?",
    isPublished: true,
    displayOrder: 1,
    content: `
      <h2>What Is Good Management?</h2>
      <p>Good management is about outcomes, clarity, and empathy. It aligns people and systems to produce results sustainably.</p>
      <ul>
        <li>Set clear expectations</li>
        <li>Provide consistent feedback</li>
        <li>Invest in growth</li>
      </ul>
      <p>Short video:</p>
      <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allow="autoplay; encrypted-media" referrerpolicy="no-referrer"></iframe>
    `,
  },
  {
    id: "ch-002",
    categoryId: "cat-foundations",
    title: "Setting Goals That Stick",
    isPublished: true,
    displayOrder: 2,
    content: `
      <h2>Setting Goals That Stick</h2>
      <p>Use the 3C model: Clear, Connected, and Checkable.</p>
      <ol>
        <li>Clear: precise outcome & constraints</li>
        <li>Connected: tied to team & company goals</li>
        <li>Checkable: observable acceptance criteria</li>
      </ol>
    `,
  },
  {
    id: "ch-101",
    categoryId: "cat-communication",
    title: "Giving Actionable Feedback",
    isPublished: false,
    displayOrder: 1,
    content: `
      <h2>Giving Actionable Feedback</h2>
      <p>This is a draft chapter and should not appear to regular users.</p>
    `,
  },
];

// Query helpers (mimic what API would provide)

export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getChapters(): Chapter[] {
  return [...chapters].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getPublishedChapters(): Chapter[] {
  return getChapters().filter((c) => c.isPublished);
}

export function getChaptersByCategory(categoryId: string): Chapter[] {
  return getPublishedChapters().filter((c) => c.categoryId === categoryId);
}

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function getPrevNextChapter(id: string): { prev?: Chapter; next?: Chapter } {
  const published = getPublishedChapters();
  const idx = published.findIndex((c) => c.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? published[idx - 1] : undefined,
    next: idx < published.length - 1 ? published[idx + 1] : undefined,
  };
}