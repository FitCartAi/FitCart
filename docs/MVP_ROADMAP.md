# FitCart MVP Roadmap

Updated 2026-09-17 for the onboarding feature branch.

**Verified** means a named check passed. **Implemented / awaiting verification** means code exists but integration checks remain. **Mocked** means deliberately synthetic. **Planned** means not built. Code existence does not mean deployed or fully working.

## Milestone 0 - Foundation

Architecture, repository, environment template and app shell exist. Browser-first Codespaces setup and a GitHub verification workflow are implemented. Full app build and real cloud startup remain verification gates. Vercel is not connected. No local installation is required for the proposed preview workflow.

## Milestone 1 - Guest onboarding

Status: **Implemented / awaiting full app verification**.

- [x] Typed draft and normalized profile contract
- [x] Goal, age, sex, activity and imperial/metric measurements
- [x] Diet, explicit allergies, restrictions and dislikes
- [x] Weekly household budget, days, meals, people and optional store/location
- [x] Cooking skill, time, meal prep, equipment and favorites
- [x] Step validation and final review with edits
- [x] Memory-only default, opt-in tab storage and reset
- [x] Synthetic sample answers
- [x] 19 profile unit tests passed
- [ ] Full app lint, typecheck and build verified
- [ ] Desktop/mobile browser and human usability checks passed

## Milestone 2 - Mock result screens

Status: **Mocked / implemented, awaiting browser review**.

Profile summary, fixed seven-day layout, consolidated groceries, fictional totals, checkboxes, printing and preset lunch swaps exist. The sample is separate from profile answers and is not allergy-screened. Nutrition targets and a personalized explanation are not implemented. The original full milestone scope is not finished.

## Milestone 3 - Structured generation

Status: **Planned**. Select an AI provider and nutrition/safety methodology; add server-only generation, request validation, structured responses, hard constraints, rate limits and bounded failures. No API credentials are needed before this work.

## Milestone 4 - Grocery consolidation and pricing

Status: **Sample calculations verified; general engine planned**. Eight sample unit tests passed. General normalization, product matching, price provenance, unit conversions and real budget accuracy are unbuilt. The demo uses fictional whole-package prices, quantities and leftovers.

## Milestone 5 - Budget optimizer

Status: **Planned**. Personalized budget repair with substitutions and full constraint revalidation is not built. A preset sample swap is not an optimizer.

## Milestone 6 - Personalized swaps

Status: **Planned**. The sample switches one preset lunch and recalculates. User-specific replacements, locked meals and safety checks remain future work.

## Milestone 7 - Accounts and persistence

Status: **Deferred**. Supabase, auth, protected profiles, migrations, plan history and account deletion are not connected. Tab storage is not an account database.

## Milestone 8 - Clemson testing

Status: **Initial interface testing next**. After a successful preview, test question clarity, completion, editing, quantities and layout. Use interviews or a team-managed survey; feedback collection is not in the app. Do not infer nutritional adequacy, personalized recommendations or store budget accuracy from the fixture.

## Next gates

1. Green GitHub application checks and a successful cloud preview.
2. Team review of the questionnaire and sample.
3. Commit a generated lockfile after successful install.
4. Document planning/nutrition/safety implementation before AI integration.

Still deferred: live retailer inventory, checkout, receipts, pantry intelligence, subscriptions, native mobile and clinical nutrition.
