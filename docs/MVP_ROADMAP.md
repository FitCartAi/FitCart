# FitCart MVP Roadmap

Status labels:

- **Working** — implemented and verified
- **In progress** — actively being built
- **Mocked** — intentionally simulated for MVP validation
- **Planned** — accepted but not started
- **Deferred** — intentionally outside the current milestone

## Milestone 0 — Repository and development foundation

Status: **In progress**

Deliverables:

- [x] Initialize GitHub repository
- [x] Document MVP architecture
- [x] Create decision log
- [x] Create README and environment template
- [x] Add minimal Next.js application shell
- [ ] Install dependencies locally and verify `npm run dev`
- [ ] Verify `npm run lint`
- [ ] Connect Vercel project

Exit criteria:

- a teammate can clone the repository, install dependencies, and run the app from README instructions
- `main` contains a runnable baseline

## Milestone 1 — Onboarding vertical slice

Status: **Planned**

Minimum inputs:

- first name/nickname
- age
- height
- weight
- sex
- activity level
- primary goal
- weekly grocery budget
- days to plan
- meals per day
- dietary preferences/restrictions
- allergies
- disliked foods
- preferred grocery store

Deliverables:

- [ ] typed `UserProfile` schema
- [ ] input validation
- [ ] mobile-friendly onboarding form
- [ ] guest/session persistence
- [ ] confirmation/summary before generation

Exit criteria:

- a test user can complete onboarding without an account
- application receives one validated structured profile object

## Milestone 2 — Mock plan result

Status: **Planned**

Purpose: validate the experience before paying for or debugging AI generation.

Deliverables:

- [ ] goal summary
- [ ] general estimated nutrition targets
- [ ] seven-day meal-plan UI
- [ ] consolidated grocery-list UI
- [ ] estimated total
- [ ] short explanation of why the plan fits

Data status: **Mocked**

Exit criteria:

- the prototype scenario can move from onboarding to a believable complete results page

## Milestone 3 — Structured plan generation

Status: **Planned**

Deliverables:

- [ ] choose AI provider
- [ ] provider-independent AI service interface
- [ ] structured generation schema
- [ ] validation and retry/error handling
- [ ] fixed test profiles

Exit criteria:

- structured plan generation succeeds reliably for the internal demo profile
- invalid output is rejected rather than rendered

## Milestone 4 — Grocery consolidation and pricing

Status: **Planned**

Deliverables:

- [ ] normalize ingredient names/units
- [ ] combine duplicate grocery ingredients
- [ ] categorize grocery items
- [ ] mock/curated price dataset
- [ ] calculate estimated total with deterministic code
- [ ] unit tests for consolidation and totals

Pricing status: **Mocked**

## Milestone 5 — Budget optimizer

Status: **Planned**

Deliverables:

- [ ] detect over-budget plans
- [ ] identify costly ingredients/meals
- [ ] apply/request substitutions
- [ ] recalculate total
- [ ] surface savings clearly

Exit criteria:

- an over-budget test profile can be revised toward the user's budget without rebuilding the entire application flow

## Milestone 6 — Meal/ingredient swap

Status: **Planned**

Deliverables:

- [ ] replace one meal or ingredient
- [ ] recompute affected grocery quantities
- [ ] recompute price
- [ ] preserve unrelated meals

## Milestone 7 — Persistence and accounts

Status: **Deferred until core flow works**

Deliverables:

- [ ] Supabase project/database
- [ ] database migrations
- [ ] Supabase Auth
- [ ] saved profile
- [ ] saved plan history

## Milestone 8 — Clemson alpha

Status: **Planned**

Collect:

- onboarding completion
- generation success
- perceived personalization
- grocery-list usefulness
- budget believability
- meal usefulness
- willingness to use next week
- qualitative corrections/comments

## Explicitly deferred beyond MVP foundation

- native mobile application
- live retailer inventory
- receipt scanning
- grocery delivery checkout
- pantry intelligence
- social features
- payments/subscriptions
- clinical nutrition functionality
- custom machine-learning models