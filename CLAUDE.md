# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

There are no automated tests.

## Stack

- **Next.js 16.2.6** (App Router) — breaking changes from older versions; read `node_modules/next/dist/docs/` before writing any code
- **React 19.2.4**
- **Tailwind CSS v4** — configuration and syntax differ significantly from v3
- **TypeScript** with path alias `@/` mapping to the project root
- **Firebase Admin / Firestore** — server-side only, lazily initialised
- **Vertex AI / Gemini 2.5 Pro** — pitch deck extraction and candidate ranking
- **Apify** — LinkedIn profile scraping

## Architecture

### Mock / Live toggle system

Every external integration has a `MOCK_*` env flag (default `true`). The flag is read in [lib/config.ts](lib/config.ts); set any flag to `"false"` to enable the live integration. All flags are independent.

| Flag | Default behaviour | Live behaviour |
|------|------------------|----------------|
| `MOCK_DATA_STORE` | in-memory store (`globalThis.__cradleStore`) | Firestore |
| `MOCK_EXTRACTION` | hardcoded company profile | Gemini 2.5 Pro reads pitch deck PDF |
| `MOCK_ENRICHMENT` | hardcoded CEO profile | Apify LinkedIn scraper |
| `MOCK_MATCHING` | keyword overlap scoring | Gemini 2.5 Pro re-ranks candidates |

### Data layer

[lib/store.ts](lib/store.ts) — synchronous in-memory store seeded with 5 companies, 15 mentors, 10 partners, 3 programmes, 5 relationships, 9 milestones, and 1 email draft. Persisted in `globalThis.__cradleStore` so Next.js hot reloads don't reset data.

[lib/services/data.ts](lib/services/data.ts) — async wrapper with the same function signatures as `lib/store.ts`. API routes **only import from `lib/services/data`**, never directly from `lib/store`. This is the only file that touches Firestore.

[lib/types.ts](lib/types.ts) — all shared TypeScript types. Key entities: `Company`, `Mentor`, `Partner`, `Programme`, `Relationship`, `Milestone`, `EmailDraft`, `MatchCandidate`.

### Services

- [lib/services/matching.ts](lib/services/matching.ts) — `runMatching()` dispatches to mock keyword scoring or 3 parallel Gemini calls (MentorMatcher, ProgrammeMatcher, PartnerMatcher sub-agents)
- [lib/services/extraction.ts](lib/services/extraction.ts) — `extractProfile()` parses a pitch deck PDF via Gemini multimodal or returns a hardcoded mock
- [lib/services/enrichment.ts](lib/services/enrichment.ts) — `enrichCeoProfile()` scrapes CEO LinkedIn via Apify or returns a hardcoded mock

### API routes

All under `app/api/`. Route handler `params` are typed as `Promise<{ id: string }>` and must be awaited — this is a Next.js 16 breaking change.

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/companies` | GET, POST | list companies; POST extracts profile from pitch deck upload |
| `/api/companies/[id]` | GET, PATCH | single company |
| `/api/companies/[id]/match` | POST | run matching agents, cache `CandidatesResult` |
| `/api/companies/[id]/candidates` | GET | retrieve cached `CandidatesResult` |
| `/api/companies/[id]/enrich` | POST | enrich CEO LinkedIn profile |
| `/api/relationships` | GET, POST | list (filter by `?company_id=`); create in `Proposed` state |
| `/api/relationships/[id]` | GET, PATCH | single relationship |
| `/api/relationships/[id]/activate` | POST | transitions to `Active`, auto-generates 3 milestones and an intro email draft |
| `/api/relationships/[id]/draft` | GET, PATCH | intro email draft for a relationship |
| `/api/milestones/[id]` | GET, PATCH | single milestone |
| `/api/dashboard` | GET | portfolio stats + active pairings with health signals |
| `/api/target-info/[type]/[id]` | GET | display metadata for a match candidate (name, subtitle, tags) |
| `/api/seed` | POST | writes mock data to Firestore; only works with `MOCK_DATA_STORE=false` |

### Pages and components

| Path | Component | Role |
|------|-----------|------|
| `/dashboard` | — | Portfolio overview |
| `/companies` | — | Company list |
| `/companies/new` | `OnboardWizard` | Multi-step company onboarding |
| `/companies/[id]` | — | Company detail |
| `/companies/[id]/match` | `MatchingBoard` | Run matching agents, approve candidates |
| `/relationships/[id]` | `RelationshipDetail` | View/manage an active relationship |

`MatchingBoard` drives the core AI workflow: triggers `POST /api/companies/[id]/match`, fetches display info per candidate from `/api/target-info`, then posts approved candidates to `/api/relationships` before navigating to the relationship detail page.

### Relationship lifecycle

`Proposed` → (approve via matching board) → `AwaitingReview` → (POST `/activate`) → `Active`

Activation auto-generates 3 milestones (`ai_drafted`) and, for mentor relationships, drafts an intro email.

## Environment

Copy `.env.example` to `.env.local`. All `MOCK_*` flags default to `true` so the app runs with zero credentials. To connect live services, set the relevant flag to `"false"` and supply the corresponding credentials (`GOOGLE_CLOUD_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `APIFY_API_TOKEN`, etc.). When connecting Firestore for the first time, call `POST /api/seed` once to populate collections.
