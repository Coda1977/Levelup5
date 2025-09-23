# ADR 0001: Title Goes Here

Status: Proposed | Accepted | Rejected
Date: YYYY-MM-DD
Owner: your-name

Context
- What problem are we trying to solve?
- What constraints and forces apply (security, RLS, client-server boundary, performance, product scope)?
- Prior related decisions or documents:
  - [ARCHITECTURE.md](LevelUp5/ARCHITECTURE.md)
  - [SECURITY.md](LevelUp5/SECURITY.md)
  - [AGENT_GUIDELINES.md](LevelUp5/AGENT_GUIDELINES.md)
  - [README.md](LevelUp5/README.md)

Decision
- The choice made and why it’s the best fit given constraints.
- Scope of the decision (what it affects and what it explicitly does not affect).

Options considered
- Option A: Summary, pros, cons
- Option B: Summary, pros, cons
- Option C: Summary, pros, cons

Consequences
- Positive outcomes and how this simplifies the system
- Tradeoffs, risks, or new constraints introduced
- Migration or rollout plan if applicable

Security and RLS impact
- Does this change alter RLS or introduce new tables?
- If yes, link the migration and policies:
  - Example: [supabase/migrations/000X_example.sql](LevelUp5/supabase/migrations/000X_example.sql)
- Confirm no client-side bypass (service role only on server)

Client–server boundary
- Confirm all client access goes through API routes:
  - [src/app/api/...](LevelUp5/src/app/api/chapters/route.ts)
  - [src/app/api/...](LevelUp5/src/app/api/progress/route.ts)
- No direct DB operations from client components

Sanitization and embeds
- If this decision touches HTML rendering, confirm:
  - Sanitization via [src/lib/sanitize.ts](LevelUp5/src/lib/sanitize.ts)
  - Iframe allowlist unchanged (YouTube + Spotify only)

Rate limiting and validation
- If new or changed API endpoints, confirm:
  - Rate limiting via [src/lib/rate-limiter.ts](LevelUp5/src/lib/rate-limiter.ts)
  - Input validation via [src/lib/validation.ts](LevelUp5/src/lib/validation.ts)

Testing and verification
- Do we need to adjust one of the three critical tests?
  - [src/__tests__/core/auth.test.ts](LevelUp5/src/__tests__/core/auth.test.ts)
  - [src/__tests__/core/content.test.ts](LevelUp5/src/__tests__/core/content.test.ts)
  - [src/__tests__/core/admin.test.ts](LevelUp5/src/__tests__/core/admin.test.ts)

Operational notes
- Monitoring or logging considerations (error logger)
  - [src/lib/error-logger.ts](LevelUp5/src/lib/error-logger.ts)
- Deployment steps (Vercel envs, migrations application order)

Appendix
- Diagrams, links, references supporting the decision