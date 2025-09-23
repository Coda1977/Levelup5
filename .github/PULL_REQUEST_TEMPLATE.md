# PR Title (Conventional Commits)
Example: feat(learn): scaffold empty state grid

Summary
- What does this change do and why?
- User impact and acceptance criteria
- Any risks or tradeoffs

Checklist (must pass before review)
- [ ] Conventional Commits used for the title and all commits
- [ ] TypeScript builds locally (npm run build once scaffold exists)
- [ ] ESLint + Prettier pass locally (npm run lint, npm run format)
- [ ] No secrets added or echoed (envs only via .env/.platform)
- [ ] Client code does NOT query DB directly; uses API routes (fetch)
- [ ] If rendering HTML, it is sanitized via [sanitize.ts](LevelUp5/src/lib/sanitize.ts)
- [ ] Embed allowlist unchanged (YouTube + Spotify only)
- [ ] If adding an API route, apply rate limiting (see [rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)) and validate inputs (see [validation.ts](LevelUp5/src/lib/validation.ts))

Database changes (required if schema/migrations touched)
- [ ] Migration added under [supabase/migrations](LevelUp5/supabase/migrations)
- [ ] RLS policies included with the migration
- [ ] Migration comments describe intended access (owner/admin/public)
- [ ] Verified no client-side bypass of RLS (no service-role in client)

Tests (critical path only)
- [ ] Auth flow working or updated ([auth.test.ts](LevelUp5/src/__tests__/core/auth.test.ts))
- [ ] Content readable ([content.test.ts](LevelUp5/src/__tests__/core/content.test.ts))
- [ ] Admin permissions as expected ([admin.test.ts](LevelUp5/src/__tests__/core/admin.test.ts))

Files touched (link each)
- Example:
  - [api/chapters route](LevelUp5/src/app/api/chapters/route.ts)
  - [content migration](LevelUp5/supabase/migrations/0003_content.sql)
  - [sanitize lib](LevelUp5/src/lib/sanitize.ts)
  - [learn page](LevelUp5/src/app/learn/page.tsx)

Screenshots / Loom (if UI)
- Before / After
- Mobile view preferred (app is mobile-first)

Rollback plan
- How to revert safely if needed
- Data impact (migrations reversible?)

Notes for reviewers
- Areas needing special attention (RLS edge cases, rate limits, SSR/CSR boundaries)
