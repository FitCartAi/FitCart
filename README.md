# FitCart

FitCart is a personalized grocery-planning MVP that turns a user's fitness goal, food preferences, grocery budget, location, and store preference into a practical weekly meal plan and grocery list.

> **MVP principle:** Build the simplest reliable workflow that proves users value a personalized, budget-aware grocery plan.

## MVP workflow

1. User completes onboarding.
2. FitCart calculates general planning targets with deterministic code.
3. An AI service generates structured meal candidates.
4. Application logic validates the plan and consolidates ingredients.
5. FitCart estimates grocery cost from a clearly labeled mock/curated price dataset.
6. If the plan is over budget, FitCart proposes or applies lower-cost substitutions.
7. The user receives a weekly meal plan, grocery list, estimated total, and concise explanation.

## Initial stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL (planned; not connected yet)
- Supabase Auth (deferred until the core guest flow works)
- One AI provider behind an internal service interface (provider not selected yet)
- Vercel for deployment (planned)
- GitHub for source control

## Local development

Prerequisites:

- Node.js 20.9+ recommended
- npm

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Then open http://localhost:3000.

## Repository guide

- `src/app/` — Next.js routes and pages
- `src/components/` — reusable UI grouped by product area
- `src/services/` — business logic, AI integration, pricing, and budget logic
- `src/types/` — shared TypeScript domain types
- `src/lib/` — infrastructure helpers and configuration
- `data/` — mock/curated MVP datasets
- `docs/` — architecture, decisions, product context, and roadmap
- `tests/` — unit/integration tests and fixtures
- `supabase/` — future database migrations

## Current status

**Milestone 0 — Repository setup**

Working:

- Repository initialized
- Architecture documented
- Minimal Next.js application shell
- Environment-variable template

Planned next:

- Run and verify the app locally
- Create the onboarding vertical slice
- Add typed profile schema and validation
- Mock the first plan result before integrating AI

## Product boundaries

FitCart is intended for general food and fitness planning. It is not a medical nutrition service, a substitute for a physician or registered dietitian, a calorie-tracking platform, or a grocery-delivery company.

Never commit secrets or real API keys to this repository.