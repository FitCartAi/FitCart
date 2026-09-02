# FitCart MVP Architecture

## Goal

FitCart's MVP should prove one thing well: a user can provide a small amount of personal context and receive a practical, personalized, budget-aware weekly food plan and grocery list.

The architecture is intentionally simple. FitCart starts as a **modular monolith**: one Next.js application with clear internal boundaries rather than separate frontend/backend services.

## System overview

```text
User
  |
  v
Next.js UI
  |
  v
Application services
  |-------------------------------|
  v                               v
Deterministic logic             AI service
(targets, validation,           (meal ideas,
consolidation, pricing,         substitutions,
budget math)                    explanations)
  |                               |
  |---------------|---------------|
                  v
        PostgreSQL / Supabase
```

## Responsibilities

### UI layer

Located primarily in `src/app/` and `src/components/`.

Responsibilities:

- onboarding
- plan display
- grocery-list display
- budget status
- meal/ingredient swap controls
- loading and error states

The UI should not call an AI provider directly and should not contain pricing or nutrition calculations.

### Application/service layer

Located in `src/services/`.

Responsibilities:

- orchestrate weekly-plan generation
- calculate general planning targets
- request structured meal candidates
- validate generated plans
- consolidate ingredient quantities
- calculate estimated prices
- compare plan total to budget
- perform or request substitutions

### AI layer

Located in `src/services/ai/`.

The application will expose a provider-independent interface such as:

```ts
generateMealPlan(profile, constraints)
```

The selected provider must return machine-readable structured data that is validated before use.

AI is appropriate for:

- meal creativity
- substitutions
- concise explanations
- targeted regeneration

AI is not responsible for:

- arithmetic
- price totals
- unit conversion
- duplicate ingredient consolidation
- enforcing required schema
- deciding whether a plan exceeds budget

### Data layer

Supabase/PostgreSQL is planned for persistence after the guest-mode vertical slice works.

Initial concepts:

- profiles
- preferences
- weekly_plans
- meals
- meal_ingredients
- grocery_items
- feedback

The database schema should stay small until a feature requires additional persistence.

## Core generation pipeline

```text
Onboarding input
  -> validate and normalize profile
  -> calculate general planning targets
  -> construct structured constraints
  -> generate structured meal candidates
  -> validate output
  -> consolidate ingredients
  -> apply mock/curated prices
  -> calculate estimated total
  -> compare against weekly budget
  -> optimize/substitute when required
  -> validate again
  -> render plan
```

## Pricing strategy

Live grocery pricing is intentionally deferred.

The first MVP uses a clearly labeled mock/curated price dataset under `data/`. Pricing is an implementation behind a service boundary so a future retailer/API source can replace the mock source without rewriting plan generation.

## Authentication

Guest mode comes first. Supabase Auth is deferred until the core flow works.

Reason: accounts and sessions do not prove the core FitCart value proposition and should not block the first demo.

## Deployment

Planned:

- Application: Vercel
- Database/auth: Supabase
- Source control: GitHub

## Security and privacy principles

- never commit API keys or secrets
- use environment variables
- collect only information needed for user value
- avoid logging sensitive profile data unnecessarily
- clearly label nutrition targets as general estimates
- do not claim medical appropriateness

## When to reconsider this architecture

Consider introducing a separate backend service only if one or more of these become true:

- long-running jobs cannot fit the Next.js runtime well
- a Python-specific library becomes essential
- multiple clients require an independent API
- integrations create significant backend complexity
- scaling or reliability requirements justify service separation

Until then, keep one application.