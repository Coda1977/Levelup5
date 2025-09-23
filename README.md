# LevelUp5

Mobile-first management development app. Governance-first setup to ensure safe, reliable delivery before feature scaffolding.

Decisions locked
- Hosting: Vercel EU
- Database: Supabase EU
- Auth: Email + Password (no magic links)
- Fonts: Inter via next/font
- AI: Anthropic model id claude-3-7-sonnet (server-side only)
- Brand: LevelUp

Security notice
- The Supabase service role key was shared during planning. Rotate it immediately in the Supabase dashboard and update your local and Vercel envs.
- Never commit secrets. Use [.env.local](LevelUp5/.env.local) locally and Vercel Project Settings for production.
- Only placeholders belong in [.env.local.example](LevelUp5/.env.local.example).

Repository governance
- Contribution rules: see [CONTRIBUTING.md](LevelUp5/CONTRIBUTING.md)
- Architecture and patterns: see [ARCHITECTURE.md](LevelUp5/ARCHITECTURE.md)
- Agent guardrails and do/don’t: see [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md)
- Security baseline and RLS policies: see [SECURITY.md](LevelUp5/SECURITY.md)
- Decision records (ADRs): see [docs/adr/0001-template.md](LevelUp5/docs/adr/0001-template.md)
- Pull request checklist: see [PULL_REQUEST_TEMPLATE.md](LevelUp5/.github/PULL_REQUEST_TEMPLATE.md)

Continuous Integration
- CI is configured in [ci.yml](LevelUp5/.github/workflows/ci.yml)
- CI runs are gated to avoid false failures before the scaffold: the workflow only runs when [package.json](LevelUp5/package.json) exists.
- Branch protections: require green CI, at least 1 reviewer approval, block direct pushes to main, enforce Conventional Commits.

MCP (Model Context Protocol)
- Central configuration: [mcp-config.json](LevelUp5/mcp-config.json)
- Servers (phase 1):
  - Repo Context Indexer (Context-style): indexes src, supabase/migrations, docs
  - Filesystem (write allowlist)
  - Ripgrep Search
  - Git (branches, commits, PRs)
- Servers (phase 2):
  - Supabase SQL (dev-only, migrations path-guarded)
  - Lint/Test runner
- Agent prompts:
  - Dev agent: [dev.md](LevelUp5/agents/prompts/dev.md)
  - Reviewer agent: [reviewer.md](LevelUp5/agents/prompts/reviewer.md)

Environment variables
Create a local .env.local (never commit) from the example:

- Supabase (development)
  - NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

- Anthropic (add after scaffold or keep placeholder)
  - ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
  - ANTHROPIC_MODEL=claude-3-7-sonnet

Branching strategy
- Create short-lived feature branches: feature/auth, feature/content, feature/admin
- Merge back to main every 3–5 days
- Keep main deployable at all times

Architecture overview
- Next.js App Router (TypeScript, Tailwind)
- Supabase: Auth + Postgres with RLS enabled from day 1
- API routes bridge all client data access
- HTML content sanitized with strict allowlist (YouTube and Spotify iframes only)

Planned structure (created progressively)
- App and styles
  - [src/app/layout.tsx](LevelUp5/src/app/layout.tsx)
  - [src/app/globals.css](LevelUp5/src/app/globals.css)
- Pages
  - [src/app/page.tsx](LevelUp5/src/app/page.tsx)
  - [src/app/learn/page.tsx](LevelUp5/src/app/learn/page.tsx)
  - [src/app/learn/%5Bid%5D/page.tsx](LevelUp5/src/app/learn/%5Bid%5D/page.tsx)
  - [src/app/chat/page.tsx](LevelUp5/src/app/chat/page.tsx)
  - [src/app/admin/page.tsx](LevelUp5/src/app/admin/page.tsx)
- API routes
  - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
  - [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
  - [src/app/api/chat/route.ts](LevelUp5/src/app/api/chat/route.ts)
- Libraries and contexts
  - [src/lib/supabase-client.ts](LevelUp5/src/lib/supabase-client.ts)
  - [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
  - [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
  - [src/lib/system-prompt.ts](LevelUp5/src/lib/system-prompt.ts)
  - [src/contexts/AuthContext.tsx](LevelUp5/src/contexts/AuthContext.tsx)
- Supabase migrations
  - [supabase/migrations/0001_user_profiles.sql](LevelUp5/supabase/migrations/0001_user_profiles.sql)
  - [supabase/migrations/0002_first_admin_seed.sql](LevelUp5/supabase/migrations/0002_first_admin_seed.sql)
  - [supabase/migrations/0003_content.sql](LevelUp5/supabase/migrations/0003_content.sql)
  - [supabase/migrations/0004_progress.sql](LevelUp5/supabase/migrations/0004_progress.sql)

Getting started (after scaffold)
1. Clone and install
   - git clone https://github.com/Coda1977/Levelup5.git
   - cd Levelup5
   - npm install
2. Copy envs
   - cp .env.local.example .env.local
   - Fill Supabase values and (later) Anthropic
3. Run dev server
   - npm run dev

Operational checklists
- Before merging:
  - CI green (typecheck, build, lint, tests)
  - RLS policies present for any new tables
  - Client-side never calls the database directly (use API routes)
  - Sanitization in place for any HTML content surface

Contacts and ownership
- Repo: https://github.com/Coda1977/Levelup5.git
- Branch protections: enable in GitHub Settings → Branches (green CI, 1 reviewer, no direct pushes, Conventional Commits)

Notes
- This README is governance-first. Feature scaffolding follows after these files: [CONTRIBUTING.md](LevelUp5/CONTRIBUTING.md), [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md), [mcp-config.json](LevelUp5/mcp-config.json) are in place.