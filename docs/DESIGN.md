# LevelUp5 Design System

**Version:** 2.0  
**Last Updated:** 2025-10-02  
**Status:** Proposed

---

## 🎯 Design Philosophy

LevelUp5 is a **mobile-first management development platform** that prioritizes clarity, speed, and encouragement. Our design philosophy is rooted in:

### Core Principles

1. **Brutalist Simplicity** - Bold typography, minimal decoration, purposeful design
2. **Generous White Space** - Let content breathe, reduce cognitive load
3. **Subtle Motion** - Micro-animations that feel natural, never distracting
4. **Clear Hierarchy** - One primary action per screen, obvious next steps
5. **Playful Professionalism** - Serious about learning, fun in execution

### Design Inspirations

- **Linear** - Clean, fast, purposeful interfaces
- **Notion** - Calm, organized, intuitive navigation
- **Stripe** - Elegant gradients, clear CTAs, professional polish
- **Duolingo** - Gamification done right, encouraging without being childish

### Alignment with Architecture

This design system aligns with our architectural principles from [`ARCHITECTURE.md`](../ARCHITECTURE.md):

- **Mobile-first** - Touch targets ≥ 44px, responsive typography, no horizontal scroll
- **One primary action per screen** - Clear CTAs, reduced decision fatigue
- **Generous white space** - Implemented through spacing tokens
- **Colors from token palette only** - Strict adherence to design tokens

---

## 🎨 Design Tokens

### Color Palette

```css
/* Primary Colors */
--bg-primary: #F5F0E8;      /* Cream - Main background */
--text-primary: #1A1A1A;    /* Near-black - Primary text */
--accent-yellow: #FFD60A;   /* Yellow - Primary actions */
--accent-blue: #003566;     /* Navy - Secondary accent */

/* Supporting Colors */
--text-secondary: #6B7280;  /* Gray - Secondary text */
--white: #FFFFFF;           /* White - Cards, surfaces */
--success-green: #10B981;   /* Green - Completion, success */
--error-red: #EF4444;       /* Red - Errors, warnings */

/* Gradients */
--gradient-hero: linear-gradient(135deg, #F5F0E8 0%, #FFF9E6 100%);
--gradient-card: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
```

**Usage Guidelines:**
- Use `--bg-primary` for all page backgrounds
- Use `--accent-yellow` for primary CTAs only
- Use `--text-secondary` for metadata, timestamps, helper text
- Use `--success-green` for completion states, checkmarks
- Never use colors outside this palette

### Typography

```css
/* Font Family */
--font-sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 
             Ubuntu, Cantarell, Noto Sans, sans-serif;

/* Font Sizes */
--text-hero: clamp(48px, 8vw, 80px);      /* Landing page hero */
--text-h1: clamp(40px, 6vw, 64px);        /* Page titles */
--text-h2: clamp(32px, 5vw, 48px);        /* Section headers */
--text-h3: clamp(24px, 4vw, 32px);        /* Card titles */
--text-body: 18px;                         /* Body text */
--text-small: 16px;                        /* Metadata, labels */
--text-tiny: 14px;                         /* Timestamps, captions */

/* Font Weights */
--weight-black: 900;    /* Hero headlines */
--weight-bold: 700;     /* Section headers */
--weight-semibold: 600; /* Buttons, emphasis */
--weight-regular: 400;  /* Body text */

/* Line Heights */
--leading-tight: 1.1;   /* Headlines */
--leading-normal: 1.5;  /* UI elements */
--leading-relaxed: 1.7; /* Body text */

/* Letter Spacing */
--tracking-tight: -2px; /* Large headlines */
--tracking-normal: 0;   /* Default */
```

**Usage Guidelines:**
- Use `--text-hero` only on landing page
- Use `--text-h1` for page titles (Learn, Chat)
- Use `--text-body` for all readable content
- Use `--weight-black` sparingly for maximum impact
- Maintain `--leading-relaxed` for body text (readability)

### Spacing

```css
/* Base Unit: 4px */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;

/* Section Padding */
--section-padding-mobile: 60px;
--section-padding-desktop: 120px;

/* Card Padding */
--card-padding: 32px;

/* Gap Between Elements */
--gap-small: 16px;
--gap-medium: 24px;
--gap-large: 32px;
```

**Usage Guidelines:**
- Use multiples of 4px for all spacing
- Use `--section-padding-*` for page sections
- Use `--card-padding` for all card interiors
- Use `--gap-medium` as default between elements

### Border Radius

```css
--radius-sm: 8px;     /* Small elements */
--radius-md: 12px;    /* Cards, inputs */
--radius-lg: 16px;    /* Large cards */
--radius-xl: 24px;    /* Hero elements */
--radius-full: 9999px; /* Pills, buttons */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Transitions

```css
--transition-fast: 150ms ease-out;
--transition-base: 200ms ease-out;
--transition-slow: 300ms ease-out;
```

---

## 🧩 Component Patterns

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--accent-yellow);
  color: var(--text-primary);
  padding: 16px 32px;
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
  font-size: var(--text-body);
  transition: transform var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

**Usage:** One per screen, for primary action only

#### Secondary Button
```css
.btn-secondary {
  background: var(--white);
  color: var(--text-primary);
  border: 2px solid var(--accent-yellow);
  padding: 16px 32px;
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
}

.btn-secondary:hover {
  background: var(--bg-primary);
}
```

**Usage:** For secondary actions, "Sign In" vs "Get Started"

### Cards

#### Feature Card
```css
.card-feature {
  background: var(--white);
  padding: var(--card-padding);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.card-feature:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

**Usage:** Chapter cards, feature highlights, content containers

#### Continue Learning Card
```css
.card-continue {
  background: var(--gradient-card);
  padding: var(--space-8);
  border-radius: var(--radius-xl);
  border: 2px solid var(--accent-yellow);
  box-shadow: var(--shadow-lg);
}
```

**Usage:** Prominent "Continue Learning" section on Learn page

### Progress Indicators

#### Progress Bar
```css
.progress-bar {
  width: 100%;
  height: 12px;
  background: #E5E7EB;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--success-green);
  border-radius: var(--radius-full);
  transition: width 500ms ease-out;
}
```

**Usage:** Overall progress, category progress

#### Completion Badge
```css
.badge-complete {
  width: 32px;
  height: 32px;
  background: var(--success-green);
  color: var(--white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-bold);
  animation: fadeIn 300ms ease-out;
}
```

**Usage:** Chapter completion indicators

### Chat Components

#### Message Bubble (User)
```css
.message-user {
  background: var(--accent-yellow);
  color: var(--text-primary);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg) var(--radius-lg) 0 var(--radius-lg);
  max-width: 70%;
  margin-left: auto;
  animation: slideUp 200ms ease-out;
}
```

#### Message Bubble (AI)
```css
.message-ai {
  background: var(--white);
  color: var(--text-primary);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) 0;
  max-width: 70%;
  box-shadow: var(--shadow-sm);
  animation: slideUp 200ms ease-out;
}
```

#### Typing Indicator
```css
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--space-4);
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
```

---

## 📱 Page-Specific Designs

### Landing Page ([`src/app/page.tsx`](../src/app/page.tsx))

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [LevelUp]              Learn  Chat  Sign In│
├─────────────────────────────────────────────┤
│                                             │
│         Master Management                   │
│         in 5 Minutes a Day                  │
│                                             │
│    Bite-sized lessons. AI coaching.         │
│    Real results.                            │
│                                             │
│    [Start Learning Free →]                  │
│    No credit card required                  │
│                                             │
│    ┌──────┐ ┌──────┐ ┌──────┐              │
│    │  📚  │ │  🤖  │ │  📈  │              │
│    │ 50+  │ │  AI  │ │Track │              │
│    │Chaps │ │Coach │ │ Prog │              │
│    └──────┘ └──────┘ └──────┘              │
│                                             │
│    "Promoted to Senior Manager in 3 months" │
│    - Sarah K., Tech Lead                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Elements:**
- Hero headline: 64px, weight 900, -2px tracking
- Single yellow CTA button
- Three stat cards with icons
- One testimonial quote
- Subtle gradient background

**Mobile Adaptations:**
- Hero: 40px font size
- Stack stat cards vertically
- Full-width CTA button
- Reduce section padding to 60px

### Learn Page ([`src/app/learn/page.tsx`](../src/app/learn/page.tsx))

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Welcome back, Alex 👋                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  12/50 chapters complete (24%)              │
│                                             │
│  Continue Learning                          │
│  ┌─────────────────────────────────────┐   │
│  │ 📖 Giving Effective Feedback        │   │
│  │ 5 min read • Chapter 13             │   │
│  │ [Continue →]                        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Leadership Fundamentals                    │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │  ✓   │ │  ✓   │ │      │               │
│  │ Ch 1 │ │ Ch 2 │ │ Ch 3 │               │
│  │ Done │ │ Done │ │ 5min │               │
│  └──────┘ └──────┘ └──────┘               │
└─────────────────────────────────────────────┘
```

**Key Elements:**
- Personal greeting with emoji
- Prominent progress bar
- "Continue Learning" card (yellow border)
- Minimal chapter cards (title, time, status)
- Category sections with completion indicators

**Chapter Card States:**
- **Not Started:** White background, gray text
- **In Progress:** Yellow border, "Continue" button
- **Completed:** Green checkmark badge, "Review" button
- **Locked:** Blur effect, 🔒 icon, "Coming Soon"

**Mobile Adaptations:**
- Single column grid
- Larger touch targets (56px)
- Sticky progress bar at top
- Collapsible category sections

### Chat Page ([`src/app/chat/page.tsx`](../src/app/chat/page.tsx))

**Layout:**
```
┌─────────────────────────────────────────────┐
│  🤖 Your AI Coach                    [≡]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                             │
│  💬 How do I give constructive feedback?    │
│                                             │
│  Great question! Here's a simple framework: │
│  1. Start with observation                  │
│  2. Share the impact                        │
│  3. Ask for their perspective               │
│  4. Agree on next steps                     │
│                                             │
│  Want to practice this with a scenario?     │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [Type your message...]            [Send →] │
└─────────────────────────────────────────────┘
```

**Key Elements:**
- Full-width chat interface
- Conversations in dropdown menu (top-right)
- Clean message bubbles (user right, AI left)
- Fixed bottom input bar
- Typing indicator (three animated dots)

**Message Styling:**
- User messages: Yellow background, right-aligned
- AI messages: White background, left-aligned, shadow
- Generous padding (16px vertical, 24px horizontal)
- Max width: 70% of container

**Mobile Adaptations:**
- Full-screen chat
- Bottom input bar (fixed)
- Conversations: Slide-up drawer
- Swipe to go back

---

## ✨ Micro-Interactions

### Button Interactions
```css
/* Hover */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Active/Press */
.btn:active {
  transform: scale(0.98);
}

/* Loading */
.btn-loading {
  animation: pulse 1.5s infinite;
}
```

### Card Interactions
```css
/* Hover */
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* Click */
.card:active {
  transform: scale(0.99);
}
```

### Progress Bar Animation
```css
.progress-fill {
  transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Milestone celebration */
@keyframes confetti {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 0; }
}
```

### Chat Message Animations
```css
/* Message appear */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typing indicator */
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```

---

## 📐 Layout Guidelines

### Grid System
- **Desktop:** 12-column grid, 24px gutters
- **Tablet:** 8-column grid, 20px gutters
- **Mobile:** 4-column grid, 16px gutters

### Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1152px;  /* Max content width */
```

### Touch Targets
- **Minimum:** 44px × 44px (iOS guideline)
- **Recommended:** 48px × 48px (Material Design)
- **Comfortable:** 56px × 56px (for primary actions)

---

## ♿ Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--accent-yellow);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### Color Contrast
- **Text on cream background:** 4.5:1 minimum (WCAG AA)
- **Text on white cards:** 7:1 minimum (WCAG AAA)
- **Yellow buttons:** Ensure text contrast meets AA standards

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support
- Use semantic HTML (`<nav>`, `<main>`, `<article>`)
- Provide `aria-label` for icon-only buttons
- Include skip-to-content links
- Ensure keyboard navigation works

---

## 🚀 Implementation Phases

### Phase 1: Foundation (2 days)
**Files to update:**
- [`src/app/globals.css`](../src/app/globals.css) - Update design tokens
- [`src/app/page.tsx`](../src/app/page.tsx) - Simplify landing page hero
- Add micro-animations to buttons and cards
- Test on mobile devices

**Success Criteria:**
- All design tokens defined in CSS
- Landing page matches new design
- Animations feel smooth (60fps)
- Mobile layout works perfectly

### Phase 2: Learn Page (2 days)
**Files to update:**
- [`src/app/learn/page.tsx`](../src/app/learn/page.tsx) - Add "Continue Learning" section
- Simplify chapter cards
- Add locked state for future chapters
- Improve progress bar styling

**Success Criteria:**
- "Continue Learning" card is prominent
- Chapter cards are scannable
- Progress bar animates smoothly
- Mobile grid works well

### Phase 3: Chat Page (2 days)
**Files to update:**
- [`src/app/chat/page.tsx`](../src/app/chat/page.tsx) - Remove permanent sidebar
- [`src/components/ChatInterface.tsx`](../src/components/ChatInterface.tsx) - Simplify message styling
- [`src/components/ConversationSidebar.tsx`](../src/components/ConversationSidebar.tsx) - Convert to dropdown
- Add typing indicator

**Success Criteria:**
- Chat feels spacious and focused
- Conversations accessible via dropdown
- Typing indicator works
- Mobile UX is excellent

### Phase 4: Polish (1 day)
- Test all interactions
- Optimize animation performance
- Run accessibility audit
- Performance check (Lighthouse)
- Cross-browser testing

**Success Criteria:**
- Lighthouse score > 90
- No accessibility violations
- Works in Chrome, Safari, Firefox
- Animations run at 60fps

---

## 📊 Success Metrics

### Performance
- **Page Load Time:** < 2 seconds
- **Time to Interactive:** < 1 second
- **First Contentful Paint:** < 1 second
- **Lighthouse Score:** > 90

### Usability
- **Mobile Usability Score:** > 90
- **Touch Target Size:** 100% compliance
- **Color Contrast:** WCAG AA compliance
- **Keyboard Navigation:** Full support

### User Satisfaction
- **User Satisfaction:** > 4.5/5
- **Task Completion Rate:** > 90%
- **Time on Page:** Increase by 20%
- **Return Rate:** Increase by 15%

---

## 🔗 References

### Internal Documents
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) - Technical architecture
- [`README.md`](../README.md) - Project overview
- [`docs/ROADMAP.md`](./ROADMAP.md) - Feature roadmap

### Design Inspiration
- [Linear Design System](https://linear.app/design)
- [Notion Design](https://www.notion.so)
- [Stripe Design](https://stripe.com/design)
- [Duolingo Design](https://design.duolingo.com)

### Design Resources
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com) - Accessible components
- [Heroicons](https://heroicons.com) - Icon system
- [Inter Font](https://rsms.me/inter/) - Typography

---

## 📝 Change Log

### Version 2.0 (2025-10-02)
- Complete design system overhaul
- Simplified color palette
- Updated typography scale
- New component patterns
- Added micro-interactions
- Mobile-first refinements

### Version 1.0 (Initial)
- Basic design tokens
- Initial component library
- Mobile-first approach established

---

**Maintained by:** Design Team  
**Questions?** Open an issue or contact the team