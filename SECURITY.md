# SECURITY

This document defines mandatory security practices for LevelUp5. All contributors (humans and agents) must follow these rules.

Scope and sources of truth
- App: Next.js (App Router, TypeScript, Tailwind)
- Backend: Supabase (Auth + Postgres with RLS)
- AI: Anthropic (server-side only)
- Governance: CI, branch protections, Conventional Commits

Immediate action
- Rotate Supabase service role key (shared during planning). In Supabase:
  1) Project Settings → API → Service Role
  2) Rotate key
  3) Update local .env.local and Vercel Environment Variables

Secrets policy
- Never commit or print secrets. Keep secrets only in:
  - Local: .env.local (gitignored)
  - Vercel: Project Settings → Environment Variables
- Checked-in files must only contain placeholders:
  - [.env.local.example](LevelUp5/.env.local.example)
- Server-only secrets must never reach the browser bundle:
  - SUPABASE_SERVICE_ROLE_KEY
  - ANTHROPIC_API_KEY

Required environment variables
- Supabase
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY (server only)
- Anthropic (added after scaffold)
  - ANTHROPIC_API_KEY (server only)
  - ANTHROPIC_MODEL=claude-3-7-sonnet

RLS (Row-Level Security) baseline
- Enabled on all user-scoped tables by default
- Example policies (final definitions live in migrations):
  - user_profiles: users can read/update their own record; admins read all
  - chapters: readable when is_published = true; admins read/write all
  - user_progress: user can read/write only rows where user_id = auth.uid()
  - conversations/messages: owner-only for all actions
- No schema merges without RLS policies in the same migration

Client–server data boundary
- Client code never queries the database directly
- All client data access goes through API routes:
  - [api/chapters](LevelUp5/src/app/api/chapters/route.ts)
  - [api/progress](LevelUp5/src/app/api/progress/route.ts)
  - [api/chat](LevelUp5/src/app/api/chat/route.ts)
- Service Role usage must be strictly server-side and minimal

HTML sanitization and embeds
- All HTML must be sanitized via [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
- Allowed iframe sources at launch:
  - https://www.youtube.com/embed/
  - https://open.spotify.com/embed/
- No inline scripts; strip unknown attributes

Rate limiting and validation
- Apply rate limiting to new API routes using [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
- Validate API inputs using [src/lib/validation.ts](LevelUp5/src/lib/validation.ts)
- Suggested limits (subject to tuning):
  - auth: 5/min
  - api: 30/min
  - ai: 10/min per user
  - admin: 100/min

CI and branch protections (without CODEOWNERS)
- CI must be green to merge: typecheck, lint, tests, build (see [ci.yml](LevelUp5/.github/workflows/ci.yml))
- Require at least 1 reviewer approval
- Block direct pushes to main
- Enforce Conventional Commits in pre-commit and CI

PR review checklist (must be in PR description)
- No secrets added or echoed
- Client uses API routes (no direct DB)
- RLS present/updated for any new table
- Sanitization enforced for any HTML render
- Rate limiter and validation on new API routes
- Conventional Commits and green CI

Key rotation procedure
1) Rotate in Supabase dashboard (Service Role key)
2) Update:
   - Local: .env.local
   - Vercel: Project → Settings → Environment Variables
3) Invalidate old deployments if necessary
4) Document rotation (date, reason) in an ADR if non-routine

Incident response (minimal)
- Capture errors via:
  - [src/lib/error-logger.ts](LevelUp5/src/lib/error-logger.ts)
  - [api/test-error](LevelUp5/src/app/api/test-error/route.ts) for smoke checks
- For suspected data exposure:
  1) Rotate relevant keys immediately
  2) Disable offending routes
  3) Create ADR documenting root cause and fix plan

References
- Governance overview: [README.md](LevelUp5/README.md)
- Contribution rules: [CONTRIBUTING.md](LevelUp5/CONTRIBUTING.md)
- Agent guardrails: [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md)