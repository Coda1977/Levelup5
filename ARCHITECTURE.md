# LevelUp5 Architecture

Goal: simple, secure, mobile-first Next.js app with database-driven content, strict RLS, and governance-first delivery.

System overview
- Frontend: Next.js (App Router, TypeScript, Tailwind)
- API layer: Next.js Route Handlers (server-only)
- Auth/DB: Supabase (Auth + Postgres with RLS)
- AI: Anthropic (server-only usage, model claude-3-7-sonnet)
- Observability: minimal DB error logs (expand later), CI enforcement
- Governance: PR template, CI checks, branch protections, Conventional Commits

Core principles
- Data, not code: chapters and categories live in the DB, not hardcoded React
- API bridge: client fetches via API routes, never direct DB access
- RLS-first: no table without row-level security
- Sanitization: only sanitized HTML and whitelisted embeds
- Minimal tests: three critical tests (auth, content access, admin)

Top-level structure (created progressively)
- App shell and styles
  - [src/app/layout.tsx](LevelUp5/src/app/layout.tsx)
  - [src/app/globals.css](LevelUp5/src/app/globals.css)
- Public and authenticated pages
  - [src/app/page.tsx](LevelUp5/src/app/page.tsx) (landing, CTA to login)
  - [src/app/learn/page.tsx](LevelUp5/src/app/learn/page.tsx) (index; empty state initially)
  - [src/app/learn/%5Bid%5D/page.tsx](LevelUp5/src/app/learn/%5Bid%5D/page.tsx) (chapter; sanitized HTML)
  - [src/app/chat/page.tsx](LevelUp5/src/app/chat/page.tsx) (Week 4)
  - [src/app/admin/page.tsx](LevelUp5/src/app/admin/page.tsx) (Week 3)
- API routes (server-only)
  - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
  - [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
  - [src/app/api/chat/route.ts](LevelUp5/src/app/api/chat/route.ts)
- Libraries and contexts
  - [src/lib/supabase-client.ts](LevelUp5/src/lib/supabase-client.ts) (factory; server/client aware)
  - [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts) (HTML sanitization with allowlist)
  - [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
  - [src/lib/system-prompt.ts](LevelUp5/src/lib/system-prompt.ts)
  - [src/contexts/AuthContext.tsx](LevelUp5/src/contexts/AuthContext.tsx)
- Middleware
  - [src/middleware.ts](LevelUp5/src/middleware.ts) (gates Learn/Chat/Admin; login public)
- Supabase migrations (RLS included)
  - [supabase/migrations/0001_user_profiles.sql](LevelUp5/supabase/migrations/0001_user_profiles.sql)
  - [supabase/migrations/0002_first_admin_seed.sql](LevelUp5/supabase/migrations/0002_first_admin_seed.sql)
  - [supabase/migrations/0003_content.sql](LevelUp5/supabase/migrations/0003_content.sql)
  - [supabase/migrations/0004_progress.sql](LevelUp5/supabase/migrations/0004_progress.sql)

Client–server boundary
- Client components NEVER import a database client for direct queries
- All data access from client goes through fetch('/api/...') to route handlers
  - Example endpoints:
    - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
    - [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
- Server (route handlers and server components) may use Supabase service role when strictly required and justified; default to anon where possible

RLS and roles
- user_profiles: id (uuid, same as auth.users.id), role enum ('user', 'admin'), profile fields
  - Policies: users can read/update only their profile; admin can read all; role changes restricted to admin
- chapters: id, category_id, title, content (HTML), is_published, display_order
  - Policies: authenticated users SELECT only when is_published = true; admin full access
- categories: id, title, display_order
  - Policies: authenticated users SELECT; admin full access
- user_progress: user_id, chapter_id, completed_at
  - Policies: user can CRUD where user_id = auth.uid(); unique (user_id, chapter_id)
- conversations/messages (Week 4): owner-only access for all actions

Sanitization and embeds
- All HTML rendered via [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
- Iframe allowlist at launch:
  - https://www.youtube.com/embed/
  - https://open.spotify.com/embed/
- Disallow inline scripts and unknown attributes; strip styles except safe subset if needed

Rate limits and validation
- Rate limits applied in route handlers using [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
  - Suggested defaults: auth 5/min, api 30/min, ai 10/min per user, admin 100/min
- Validate inputs in route handlers via [src/lib/validation.ts](LevelUp5/src/lib/validation.ts)

Auth flow
- Email + password (no magic links)
- Login page: [src/app/auth/login/page.tsx](LevelUp5/src/app/auth/login/page.tsx)
- Middleware: [src/middleware.ts](LevelUp5/src/middleware.ts) redirects unauthenticated users from /learn, /chat, /admin to /auth/login
- First admin promotion via seed migration: [supabase/migrations/0002_first_admin_seed.sql](LevelUp5/supabase/migrations/0002_first_admin_seed.sql)

AI integration (Week 4)
- Server-only route streams responses from Anthropic using ANTHROPIC_API_KEY (never exposed to client)
- System prompt stored in [src/lib/system-prompt.ts](LevelUp5/src/lib/system-prompt.ts)
- Conversations/messages persisted under user ownership; strict RLS

Testing strategy (minimal)
- [src/__tests__/core/auth.test.ts](LevelUp5/src/__tests__/core/auth.test.ts): can users sign up/log in?
- [src/__tests__/core/content.test.ts](LevelUp5/src/__tests__/core/content.test.ts): can users read published chapters?
- [src/__tests__/core/admin.test.ts](LevelUp5/src/__tests__/core/admin.test.ts): can admins manage content?

Governance files (enforcement)
- PR template: [PULL_REQUEST_TEMPLATE.md](LevelUp5/.github/PULL_REQUEST_TEMPLATE.md)
- Agent guardrails: [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md)
- Security baseline: [SECURITY.md](LevelUp5/SECURITY.md)
- CI: [ci.yml](LevelUp5/.github/workflows/ci.yml)
- Contribution guide: [CONTRIBUTING.md](LevelUp5/CONTRIBUTING.md)
- README: [README.md](LevelUp5/README.md)

ADR process
- Record significant decisions under [docs/adr](LevelUp5/docs/adr)
- Template: [docs/adr/0001-template.md](LevelUp5/docs/adr/0001-template.md)
- Link ADRs in PRs that introduce non-trivial changes or exceptions

Mobile-first design choices (enforced via Tailwind + CSS)
- Clamp typography and generous spacing in [src/app/globals.css](LevelUp5/src/app/globals.css)
- One primary action per screen; white space is generous; colors from token palette only
- Touch targets ≥ 44px; avoid horizontal scroll

Deployment and envs
- Vercel EU project; envs configured via Vercel settings
- Local development: copy [.env.local.example](LevelUp5/.env.local.example) to .env.local (never commit real secrets)
- Supabase service role key is server-only; rotate compromised keys immediately

Non-goals (v1)
- No TTS at launch; consider Month 2–3
- No Google OAuth at launch; consider Week 4–6 after validation
- No advanced analytics; defer to Week 3 planning

References
- Governance overview: [README.md](LevelUp5/README.md)
- Security practices: [SECURITY.md](LevelUp5/SECURITY.md)
- Agent rules: [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md)