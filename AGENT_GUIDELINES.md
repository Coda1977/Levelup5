# Agent Guidelines for LevelUp5

Purpose: codify strict guardrails for AI and human contributors to keep the codebase simple, secure, and shippable.

Authoritative references (filenames)
- Architecture and patterns: [ARCHITECTURE.md](LevelUp5/ARCHITECTURE.md)
- Security and RLS: [SECURITY.md](LevelUp5/SECURITY.md)
- Contribution process: [CONTRIBUTING.md](LevelUp5/CONTRIBUTING.md)
- PR checklist: [PULL_REQUEST_TEMPLATE.md](LevelUp5/.github/PULL_REQUEST_TEMPLATE.md)
- MCP config: [mcp-config.json](LevelUp5/mcp-config.json)
- System prompt (AI coach): [src/lib/system-prompt.ts](LevelUp5/src/lib/system-prompt.ts)
- Sanitization: [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
- API routes: 
  - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
  - [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
  - [src/app/api/chat/route.ts](LevelUp5/src/app/api/chat/route.ts)

Golden rules
1) Delete before you add. Prefer removing complexity to adding abstractions.
2) Trust the framework. Use Next.js routing, caching, and SSR/ISR defaults.
3) Client never talks directly to the DB. Use API routes as the bridge.
4) RLS first. No table is merged without RLS policies and tests in place.
5) Sanitize all untrusted HTML. Only whitelisted iframes (YouTube/Spotify) are allowed.
6) Keep tests minimal but critical. Only three critical tests (auth, content access, admin).
7) Conventional Commits. Every commit must follow the standard.
8) Short-lived branches. Merge back to main within 3–5 days max.

Security boundaries
- Secrets are never hardcoded or printed. Use environment variables loaded via .env.local (never committed) and platform env configuration.
  - Placeholders only in [README.md](LevelUp5/README.md) and [.env.local.example](LevelUp5/.env.local.example).
- Service role keys are restricted to server-side only and must never appear in client bundles.
- Sanitization is mandatory for any HTML render surface via [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts).
- Rate limits must be applied to new API routes; see [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts).

Architectural constraints
- App Router + TypeScript + Tailwind.
- Client components fetch via API only (no Supabase client direct DB reads in the browser).
- Server (API routes / server components) may access Supabase with service role if absolutely needed and justified.
- Content is data in the database, not React code; render sanitized HTML in chapter pages.
- RLS templates:
  - user-scoped tables: auth.uid() = user_id
  - public content: readable when is_published = true
  - admin mutations: restricted by role in user_profiles

RLS requirements for any new table
- Policies must be included with the migration.
- Least privilege by default; explicitly enable operations needed.
- Add a small verification query snippet to the migration comments explaining the intended access pattern.

PR checklist expectations
- Auth and RLS verified (no raw access from the client).
- Sanitization for any HTML or user-generated content.
- Rate limiter applied to new API surface.
- Tests: keep to the three critical paths; add or update only if the change touches them.
- Commit message follows Conventional Commits.
- Links to files touched must be included in the PR description:
  - Example: 
    - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
    - [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
    - [supabase/migrations/0003_content.sql](LevelUp5/supabase/migrations/0003_content.sql)

File editing allowlist
- Allowed:
  - src/**, supabase/migrations/**, configuration at the root (eslint, prettier, tsconfig), .github/**, agents/**, docs/**
- Prohibited:
  - node_modules/**, .next/**, any secrets file (except local .env.local which is untracked), binary assets without approval

MCP usage policy (phase 1)
- Repo Context server: build and use an index of src, supabase/migrations, docs to ground changes.
- Filesystem server: write operations restricted to allowlisted paths above.
- Ripgrep Search server: prefer precise regex searches to locate definitions/usages.
- Git server: create short-lived branches, commit with Conventional Commits, open PRs.

MCP usage policy (phase 2)
- Supabase SQL MCP (dev-only): 
  - Allowed: running new migrations in dev environment only.
  - Denied: destructive changes in prod or ad-hoc writes outside migrations.
- Lint/Test MCP: run lint, typecheck, and tests; attach summarized results to PR.

Naming and commits
- Branch names: feature/auth-..., feature/content-..., feature/admin-...
- Conventional Commits examples:
  - feat(learn): scaffold empty state grid
  - fix(rls): restrict user_progress updates to owner
  - chore(ci): add typecheck to CI workflow

Do / Don’t examples
- Do: add an API route and use fetch('/api/...') from client pages.
  - Example reference: [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
- Don’t: import Supabase client in a client component to query DB tables directly.
- Do: sanitize incoming HTML and whitelist embeds.
  - Example reference: [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
- Don’t: render raw HTML or allow unknown iframes.

Review guidance for agents
- If a change touches database schema:
  - Ensure migration file includes RLS policies and comments explaining intended policies.
  - Verify UI does not bypass RLS via service role on the client.
- If a change touches UI that renders HTML:
  - Ensure sanitize.ts is used and allowlist is unchanged (YouTube/Spotify only at launch).
- If a change adds an API route:
  - Apply rate limiting and input validation; confirm no secrets are exposed; default to POST for mutations.

Escalation and deviations
- Any deviation from these rules requires a documented ADR:
  - Create a new doc from [docs/adr/0001-template.md](LevelUp5/docs/adr/0001-template.md) and link it in the PR description.

Acceptance definition (Week 1 scope)
- Auth with email+password, protected Learn routes.
- Content schema + progress tables with RLS.
- Learn pages show empty states gracefully, and HTML sanitization is wired.
- CI green with lint/typecheck (tests become essential later weeks).