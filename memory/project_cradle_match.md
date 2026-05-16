---
name: project-cradle-match
description: Core context for the Cradle Match hackathon app — stack, architecture, what was built
metadata:
  type: project
---

Full-stack Next.js 16 app for Cradle's internal mentor matching platform. Built for a hackathon demo.

**Why:** Labubu (Cradle programme manager) needed an admin tool to onboard portfolio startups, match them with mentors/programmes/partners via AI agents, and track milestone progress.

**Stack:** Next.js 16.2.6 (App Router) + React 19 + Tailwind CSS v4. No external backend — all API routes in `app/api/`. In-memory data store via `globalThis.__cradleStore` in `lib/store.ts`. No Firebase/Cloud Run implemented (scope cut for hackathon).

**What was built:**
- `lib/types.ts` — TypeScript types for all entities
- `lib/store.ts` — In-memory store seeded with 5 startups, 15 mentors, 10 partners, 3 programmes, pre-existing relationships and milestones
- All API route handlers under `app/api/`
- Dashboard page (cohort overview with stats + active pairings table)
- Company onboarding wizard (simulated Gemini extraction + Apify enrichment)
- 3-column matching board (simulated ADK MatchingOrchestrator with MentorMatcher/ProgrammeMatcher/PartnerMatcher sub-agents)
- Relationship detail page (milestones + email draft editor)
- Company profile page + portfolio listing

**Demo flow:** `/dashboard` → "Onboard Startup" → upload/demo deck → extracted profile → LinkedIn enrich → "Find Matches" → 3-column approve → "Activate" → milestones generated + email draft → back to dashboard.

**How to apply:** When resuming, the dev server starts with `npm run dev`. The in-memory store resets on restart. All agent/AI calls are mocked with realistic delays and deterministic outputs.
