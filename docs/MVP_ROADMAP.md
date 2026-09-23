# FitCart MVP Roadmap

Updated 2026-09-23 for the pre-host prototype pass.

**Verified** means a named check passed. **Mocked** means deliberately synthetic. **Planned** means not built. A deployed prototype should not imply that mocked or planned capabilities are live.

## Milestone 0 - Foundation

Architecture, repository, environment template, app shell, browser-first Codespaces setup, and GitHub verification workflow exist. Vercel is not connected yet.

## Milestone 1 - Guest onboarding

Status: **Implemented and manually exercised in Codespaces**.

- [x] Typed draft and normalized profile contract
- [x] Goal, age, sex, activity, and imperial/metric measurements
- [x] Diet, reported allergies, restrictions, and dislikes
- [x] Weekly household budget, days, meals, people, and optional store/location
- [x] Cooking skill, time, meal prep, equipment, and favorites
- [x] Step validation, review, edits, reset, and optional tab storage
- [x] Synthetic sample answers
- [x] Unit tests
- [x] Successful dependency install, lint, typecheck, and production build in GitHub Actions
- [ ] Green desktop/mobile browser automation after pre-host polish

## Milestone 2 - Mock result screens

Status: **Mocked / implemented**.

The prototype includes a fixed seven-day layout, consolidated grocery list, fictional whole-package prices, grocery checkboxes, printing, and preset lunch swaps. The sample does not use questionnaire answers and is not allergy-screened.

## Pre-host testing and feedback

Status: **Implemented**.

- [x] Landing page centers the core value proposition: budgeting + fitness + meal planning + grocery planning in one workflow
- [x] Prototype limitations remain explicit
- [x] Lightweight feedback page asks about weekly use, clarity, budget usefulness, strongest value, missing features, and concerns
- [x] Feedback stays client-side and can be copied for manual collection
- [ ] Team reviews the hosted experience
- [ ] Choose the team's long-term survey/data collection method

## Milestone 3 - Structured personalized generation

Status: **Planned**. Select an AI provider and nutrition/safety methodology; add server-only structured generation, request validation, hard constraints, bounded retries, rate limits, and clear failures.

## Milestone 4 - Grocery consolidation and pricing

Status: **Sample calculations verified; general engine planned**. General ingredient normalization, product matching, unit conversion, price provenance, and real store pricing are not built.

## Milestone 5 - Budget optimizer

Status: **Planned**. Detect over-budget plans, identify costly choices, suggest substitutions, and recalculate after full constraint checks.

## Milestone 6 - Personalized swaps

Status: **Planned**. Replace one meal or ingredient while preserving unrelated meals and recalculating groceries/cost.

## Milestone 7 - Accounts and persistence

Status: **Deferred**. Supabase, auth, saved profiles, history, and account deletion remain outside the current shareable prototype.

## Milestone 8 - Clemson testing

Status: **Ready after hosting**. Test onboarding completion, perceived personalization, usefulness of the grocery workflow, budget relevance, willingness to use weekly, and qualitative corrections.

## Next gates

1. Get the GitHub verification workflow green.
2. Human review of the polished branch.
3. Merge the pull request into main.
4. Connect main to Vercel for a stable shareable URL.
5. Start structured personalized generation only after the hosted prototype is available for feedback.

Still deferred: live retailer inventory, checkout, receipts, pantry intelligence, subscriptions, native mobile, and clinical nutrition.
