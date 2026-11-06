# FitCart Decision Log

Use this file for architectural or product decisions that would otherwise be easy to forget or repeatedly debate.

## 2026-09-02 — Use a modular monolith for the MVP

### Decision

FitCart will start as one Next.js application containing UI, server-side application logic, and integration adapters.

### Why

A separate frontend/backend architecture adds deployment, API, type synchronization, and maintenance work without helping prove the MVP value proposition.

### Alternatives considered

- Next.js frontend + FastAPI backend
- separate frontend and backend repositories

### Revisit when

Backend complexity, runtime needs, integrations, or multiple clients clearly justify service separation.

---

## 2026-09-02 — Use Next.js + TypeScript + Tailwind

### Decision

Use Next.js 16, React 19, TypeScript, and Tailwind CSS 4 for the initial web application.

### Why

The stack supports a single full-stack web codebase, fast UI iteration, strong typing, and straightforward Vercel deployment.

### Alternatives considered

- Vite/React + separate API
- Python-first web frameworks

### Revisit when

A material limitation blocks a required FitCart feature.

---

## 2026-09-02 — Plan for Supabase, but defer integration

### Decision

Use Supabase PostgreSQL as the intended database and Supabase Auth as the likely account system, but do not make either a blocker for the initial guest-mode vertical slice.

### Why

Persistence and authentication are useful but do not prove whether users value the generated weekly grocery plan.

### Revisit when

The first end-to-end guest flow is working and saved profiles/plans are the next highest-value feature.

---

## 2026-09-02 — Use deterministic code for calculations and AI for flexible generation

### Decision

FitCart will use ordinary application code for validation, calculations, ingredient consolidation, cost totals, and budget comparisons. AI will generate structured meal candidates, substitutions, and explanations.

### Why

This makes core behavior easier to test, reduces arithmetic/schema errors, and prevents FitCart from becoming a thin prompt wrapper.

### Revisit when

A later capability demonstrates a safer or more reliable architecture.

---

## 2026-09-02 — Use mock/curated grocery prices in V1

### Decision

Use a clearly labeled local dataset for initial grocery price estimates rather than blocking development on live retailer integrations.

### Why

The MVP needs to prove budget-aware planning, not real-time retailer infrastructure.

### Revisit when

Users validate that store-specific price accuracy materially improves recurring value.

---

## 2026-09-02 — Guest mode before authentication

### Decision

The first complete FitCart flow will not require an account.

### Why

Reducing onboarding friction makes testing easier and keeps development focused on the product's core job-to-be-done.

### Revisit when

Saved profiles, plan history, and recurring weekly use become part of the tested MVP.

---

## 2026-10-01 — Budget-first V2A, retailer integration in V2B

### Decision

Following Brian's approval and the supplied Milestone 2 survey direction, make budgeting the primary entry point. Fitness details are optional and cleared when disabled. Keep the single Next.js application; add budget components and pure calculation modules without a new backend, AI service or dependency.

Use synthetic examples for the four requested retailers, explicit price-source metadata with no verified date, optional two-store comparisons, whole-package totals, measured pantry amounts and accept/undo substitutions. Available appliances and preferred appliances are separate; preferences must be an available subset of at most three. Meal inspiration uses those selections; a full compatible meal plan is not yet implemented.

Preserve legacy routes and V1 storage without automatically migrating sensitive data. All changes go through a separate feature branch and preview, not directly to production. See [V2A specification](V2A_BUDGET_FIRST.md).

### Why

The survey points toward affordability, while reliable local retailer data remains unverified. This separates testing the shopping experience from falsely presenting sample prices as live quotes. Numeric pantry stock prevents assuming an entire purchase is free merely because a user owns some of it.

### Alternatives considered

Continue mandatory fitness-first onboarding; build live pricing before testing the new interface; split the backend; subtract pantry items by presence alone. These were not chosen for V2A.

### Revisit when

V2B establishes permissible, current local prices and product matches; user testing shows whether quantity entry and extra-store trade-offs are useful; or full dietary/appliance-compatible planning becomes the next approved scope.
