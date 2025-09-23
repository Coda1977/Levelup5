# Contributing to LevelUp5

This repo uses a governance-first approach to keep the product simple, secure, and shippable. Follow these rules strictly.

Key references
- Project overview: [README.md](LevelUp5/README.md)
- Agent guardrails: [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md)
- Architecture: [ARCHITECTURE.md](LevelUp5/ARCHITECTURE.md)
- Security & RLS: [SECURITY.md](LevelUp5/SECURITY.md)
- PR template: [PULL_REQUEST_TEMPLATE.md](LevelUp5/.github/PULL_REQUEST_TEMPLATE.md)
- ADRs: [docs/adr/0001-template.md](LevelUp5/docs/adr/0001-template.md)

Principles
- Less is more: delete complexity before adding abstractions
- Trust the framework (Next.js, Supabase, Postgres)
- Data not code: chapters stored in DB and sanitized on render
- RLS from Day 1: no table merges without row-level security
- Client never queries DB directly; always go through API routes

Branching and commits
- Branches: feature/auth-..., feature/content-..., feature/admin-...
- Merge back to main every 3–5 days, keep main deployable
- Conventional Commits required (enforced by CI/hooks)
  - Examples:
    - feat(learn): scaffold empty state grid
    - fix(rls): restrict user_progress updates to owner
    - chore(ci): add typecheck to workflow
- Rebase or squash to keep history clean

Pull requests
- Use the PR template: [PULL_REQUEST_TEMPLATE.md](LevelUp5/.github/PULL_REQUEST_TEMPLATE.md)
- Link all touched files in the PR body (copy file links from diffs), e.g.:
  - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
  - [supabase/migrations/0003_content.sql](LevelUp5/supabase/migrations/0003_content.sql)
  - [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
  - [src/app/learn/page.tsx](LevelUp5/src/app/learn/page.tsx)
- PR checks must pass:
  - TypeScript build (once scaffold exists)
  - ESLint + Prettier
  - Critical tests (auth, content, admin) once added
- At least 1 human reviewer approval; no direct pushes to main

Security and secrets
- Never commit or print secrets. Keep .env.local untracked (local only); use Vercel env vars in production.
- Service role keys are server-only and must never be used client-side.
- Any shared/compromised key (including during planning) must be rotated; see [SECURITY.md](LevelUp5/SECURITY.md).

Database and RLS rules
- Every new table must include RLS policies in the same migration file
- Default deny; enable least-privilege operations
- Owner data uses auth.uid() = user_id
- Public chapters are readable only if is_published = true; admin can read/write all
- Include a comment block in migrations documenting intended access
- Example migration link format: [supabase/migrations/0004_progress.sql](LevelUp5/supabase/migrations/0004_progress.sql)

Client–server boundary
- Client components must not query Postgres directly
- Use API routes for all client data access
  - Examples:
    - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
    - [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
- Server components or API routes may use Supabase service role responsibly

Sanitization and embeds
- All HTML content must be sanitized via [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
- Allowlist iframes only for:
  - YouTube: https://www.youtube.com/embed/
  - Spotify: https://open.spotify.com/embed/
- No inline scripts; strip unknown attributes

Rate limiting and validation
- Apply rate limiting to new API routes using [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
- Validate inputs in API routes using [src/lib/validation.ts](LevelUp5/src/lib/validation.ts)

Testing (critical path only)
- Add/update tests only when touching critical paths:
  - [src/__tests__/core/auth.test.ts](LevelUp5/src/__tests__/core/auth.test.ts)
  - [src/__tests__/core/content.test.ts](LevelUp5/src/__tests__/core/content.test.ts)
  - [src/__tests__/core/admin.test.ts](LevelUp5/src/__tests__/core/admin.test.ts)

Directory expectations (post-scaffold)
- App shell and styles:
  - [src/app/layout.tsx](LevelUp5/src/app/layout.tsx)
  - [src/app/globals.css](LevelUp5/src/app/globals.css)
- Pages:
  - [src/app/page.tsx](LevelUp5/src/app/page.tsx)
  - [src/app/learn/page.tsx](LevelUp5/src/app/learn/page.tsx)
  - [src/app/learn/%5Bid%5D/page.tsx](LevelUp5/src/app/learn/%5Bid%5D/page.tsx)
  - [src/app/chat/page.tsx](LevelUp5/src/app/chat/page.tsx)
  - [src/app/admin/page.tsx](LevelUp5/src/app/admin/page.tsx)
- API routes:
  - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
  - [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
  - [src/app/api/chat/route.ts](LevelUp5/src/app/api/chat/route.ts)
- Libs and contexts:
  - [src/lib/supabase-client.ts](LevelUp5/src/lib/supabase-client.ts)
  - [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
  - [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
  - [src/lib/system-prompt.ts](LevelUp5/src/lib/system-prompt.ts)
  - [src/contexts/AuthContext.tsx](LevelUp5/src/contexts/AuthContext.tsx)
- Supabase migrations:
  - [supabase/migrations/0001_user_profiles.sql](LevelUp5/supabase/migrations/0001_user_profiles.sql)
  - [supabase/migrations/0002_first_admin_seed.sql](LevelUp5/supabase/migrations/0002_first_admin_seed.sql)
  - [supabase/migrations/0003_content.sql](LevelUp5/supabase/migrations/0003_content.sql)
  - [supabase/migrations/0004_progress.sql](LevelUp5/supabase/migrations/0004_progress.sql)

MCP usage (Model Context Protocol)
- Config: [mcp-config.json](LevelUp5/mcp-config.json)
- Phase 1: repo-context, filesystem (allowlisted writes), ripgrep search, git
- Phase 2: Supabase SQL (dev-only, migrations path-guarded), Lint/Test runner
- Agents should cite file paths in outputs and avoid untracked write locations

Deviation policy
- Any significant deviation requires an ADR
  - Copy [docs/adr/0001-template.md](LevelUp5/docs/adr/0001-template.md), number it sequentially, and link it in the PR

Local setup (after scaffold exists)
- Copy envs from example: [.env.local.example](LevelUp5/.env.local.example) → .env.local
- Install and run:
  - npm install
  - npm run dev
- Don’t run production migrations from local machines against prod without approval

Contact
- Repo: https://github.com/Coda1977/Levelup5.git
- Branch protection: enable in GitHub → Settings → Branches