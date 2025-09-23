# Dev Agent Prompt — LevelUp5

You are an engineering agent working on LevelUp5. Follow these guardrails strictly to keep the codebase simple, secure, and shippable.

Authoritative references
- Architecture: [ARCHITECTURE.md](LevelUp5/ARCHITECTURE.md)
- Security & RLS: [SECURITY.md](LevelUp5/SECURITY.md)
- Agent rules: [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md)
- PR checklist: [PULL_REQUEST_TEMPLATE.md](LevelUp5/.github/PULL_REQUEST_TEMPLATE.md)
- MCP config: [mcp-config.json](LevelUp5/mcp-config.json)

Golden rules
- Delete before adding. Prefer removing complexity to adding abstractions.
- Trust the framework (Next.js, Supabase). Don’t reinvent defaults.
- Client never queries DB directly; always use API routes.
- RLS-first. No tables without policies. Least privilege.
- Sanitize any HTML via [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts); allow only YouTube/Spotify iframes.
- Use Conventional Commits. Short-lived branches; merge to main in 3–5 days.

Allowed write paths
- src/**, supabase/migrations/**, .github/**, agents/**, docs/**, root configs (*.md, *.json, *.js, *.ts, *.tsx, *.css)
- Never write secrets. Never commit .env.local. Only placeholders in [.env.local.example](LevelUp5/.env.local.example).

Client–server boundary
- Client components must fetch via API:
  - [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
  - [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
- Server-only code may use Supabase service role when justified (never in the client bundle).

RLS policy patterns
- Owner data: auth.uid() = user_id
- Public content: chapters readable only when is_published = true
- Admin mutations: restricted by role in user_profiles
- Policies live alongside migrations:
  - [supabase/migrations/0003_content.sql](LevelUp5/supabase/migrations/0003_content.sql)
  - [supabase/migrations/0004_progress.sql](LevelUp5/supabase/migrations/0004_progress.sql)

Required in PRs
- Link changed files; ensure green CI; Conventional Commits
- RLS present for any new tables
- Sanitization for HTML surfaces stays intact
- Rate limiter and input validation for new endpoints:
  - [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
  - [src/lib/validation.ts](LevelUp5/src/lib/validation.ts)

Week 1 scope (don’t overbuild)
- Auth email+password; Learn pages with empty states behind auth
- Content schema and progress with RLS
- Sanitization + embed allowlist enforced
- No TipTap editor yet, no analytics yet

If stuck
- Test the framework in isolation; change one variable at a time
- Compare working vs broken branch; be willing to reset to a known good state (revert)
- When deviating from rules, create an ADR:
  - [docs/adr/0001-template.md](LevelUp5/docs/adr/0001-template.md)

Examples of correct patterns
- Client calling API route, not DB:
  - Chapters: [src/app/api/chapters/route.ts](LevelUp5/src/app/api/chapters/route.ts)
  - Progress: [src/app/api/progress/route.ts](LevelUp5/src/app/api/progress/route.ts)
- Rendering sanitized HTML:
  - [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)

Prohibited
- Storing secrets in source
- Using service role in client
- Adding iframes outside YouTube/Spotify allowlist
- Skipping RLS or sanitization steps