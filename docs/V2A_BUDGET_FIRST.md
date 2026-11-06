# FitCart V2A: budget-first preview

Approved by Brian in the project conversation; implemented 2026-10-01. This specification supersedes the fitness-first entry flow, not the original project's historical record.

## Scope and evidence

The supplied Milestone 2 presentation reports a 40-person convenience sample: 36/40 said price influences store choice, 31/40 reported overspending at least sometimes, and 34/40 used deals at least occasionally. The presentation positions a budget-first grocery list and identifies verified store data as a feasibility question. These are directional survey findings, not demonstrated savings or market-wide adoption. No names, emails, raw responses, or private charter information are included in the repository.

Brian approved hard/target/lowest-cost budgets; convenience/balanced/maximum savings; Publix, Walmart, Food Lion and ALDI as the target retailers; optional two-store comparisons; transparent price provenance; pantry inputs; available/preferred appliances; and optional fitness details. V2A uses synthetic data only. V2B must prove real retailer access before any live-pricing claim.

## Routes and rollout

- `/` is the new budget-first landing page.
- `/budget` is the six-screen setup: Budget, Stores, Food & pantry, Kitchen, Optional goals, Review.
- `/cart` uses a completed V2 setup to run the synthetic calculator.
- `/sample` explores a synthetic profile without filling out a form.
- `/feedback` retains the existing copy-and-send feedback form. No survey backend is connected.
- Legacy `/onboarding`, `/plan`, and `/demo` remain intact for compatibility and regression testing; the main navigation no longer leads to them. Their V1 session data is not migrated into V2.

All work belongs on `feature/v2a-budget-first`. A pull request and preview must be reviewed before merging; production/main is not modified by this implementation.

## Implemented vs simulated

Implemented: validation, optional session persistence, appliance subset rules, review/edit/reset, numeric budget comparison, whole-package rounding, measured pantry deductions, exact comparison across selected store pairs, explicit store choice, accepted/undoable illustrative swaps, copy/print, and kitchen-filtered meal inspiration.

Synthetic: ALL products, retailer prices, store rankings, cost differences and substitutions. Fixture prices do not represent actual Walmart, Publix, Food Lion or ALDI offers. `checkedAt` and `storeLocationId` are null. There is no retailer request, scraper, live API, loyalty login, coupon application, checkout or AI model.

Not implemented: an appliance/diet/allergy-safe full grocery plan, clinical/nutrition assessment, recipe preparation steps, macro targets, real stock/deals, personal recommendations, automatic optimization of complete meals, travel costs, accounts or feedback storage. Appliance choices filter and prioritize a finite list of inspiration ideas, NOT the basket. This limit is visible above the inspiration and at the top of the cart. No-cook users must not treat the sample as a cooking-ready list.

## Calculation decisions

Budget is the total for the selected plan period and people, not a daily/per-person allowance; it is never silently prorated. Hard/target require an amount. Lowest cost allows no cap; an entered cap is treated as a limit. A hard-limit overage remains visible and disables copying a finalized example list; the app never drops food to manufacture success. Merchandise totals exclude tax, fees, travel and time.

The fixed basket scales with days / 7 x people x meals / 3, rounding ingredient quantities up. This illustrates size-sensitive costs, not nutritional adequacy. Comparison uses the SAME items, quantities and pack sizes at all stores. A missing price makes a store quote incomplete, not zero. Incomplete quotes cannot win. Ties are disclosed without manufactured savings.

Pantry oats/rice/oil use grams/grams/milliliters. Subtract measured stock before rounding required purchases to whole packs. Clamp quantities at zero. Free-text notes are not silently subtracted. Identical canned beans are consolidated after the illustrative protein swap before package rounding.

The pair algorithm evaluates all selected store pairs and chooses the cheaper source for each whole-product line. It does not split one product across shops or include transport. Users start at a single-store cart; a second stop requires explicit selection and positive additional fixture savings. Comparing retailers changes the selected shopping assignment, not the basket. Checkmarks never change cost.

Savings modes control which optional substitutions are offered: convenience = brand change; balanced = brand plus fresh/frozen; maximum = those plus a meal/protein change. No mode overrides a dietary constraint by claiming safety; the entire fixture is explicitly not screened. Swap amounts are recalculated against the currently selected route and state, not summed from stale independent promises. Budget headroom is labeled separately from verified savings.

## Privacy and access

V2 has its own versioned key `fitcart.budget.v2`. State is memory-only by default; tab persistence is opt-in and runtime-validated. No user answers are sent to an API. Refresh loses memory-only state. Clear V2 answers removes the V2 storage key. Existing V1 data is left untouched and not auto-imported. Health details are optional, not used by the calculator, and cleared on opt-out. Use sample data on shared devices. Browser restore may retain opted-in tab data.

## Quality gates

The added unit suite covers input validation, optional nutrition, corrupt storage, preference pruning, package math, stock deductions, missing prices, pair assignments, swaps and hard limits. Browser scenarios cover blank-form errors and focus, the complete flow, appliance preference limits, allergy details, no-cook inspiration, optional data deletion, cap overages, single/split behavior, session reset, and overflow on desktop/mobile. The legacy required-field browser test is restored with the validation alert scoped to its form; no failing validation test is deleted to achieve green status.

Run `npm run check`, then `npm run test:e2e` against the production build. The existing workflow runs both and attaches browser reports. Local pure-domain verification alone is not a claim of a full production/browser pass. Check the latest PR run for full verification results.

## Next: V2B

Verify the exact local branches and permissible price sources, channel differences, identical/equivalent products and package sizes, freshness, inventory gaps, loyalty eligibility and coupon terms. Compare a real basket against checkout and explicitly measure discrepancy. Do not relabel fixture values as live data or use a build timestamp as a retailer price-check date.
