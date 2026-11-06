# FitCart MVP Roadmap

Updated 2026-10-01. The approved budget-first direction supersedes the original fitness-first feature order. Historical architecture decisions remain in DECISIONS.md.

## V1 baseline

- [x] Guest onboarding, review/edit/reset and opt-in tab storage
- [x] Fixed sample week, consolidated example groceries, fictional prices and preset lunch swaps
- [x] Copy-and-send feedback page (no backend)
- [x] PR #1 merged into main
- [x] Vercel production deployment reported working by Brian

Legacy V1 routes remain intact. V1 was a prototype, not personalized generation. The previously removed blank-form browser test is restored in V2A with form-scoped alert selection.

## V2A - budget-first preview

- [x] Budget-first homepage and separate /budget, /cart, /sample routes
- [x] Hard limit / target / lowest-cost choices
- [x] Convenience / balanced / maximum savings options
- [x] Select the four requested retailer brands
- [x] Synthetic single-store and optional two-store basket comparisons
- [x] Whole-package totals and measured pantry deductions
- [x] Accept/undo illustrative cost-reduction swaps
- [x] Available appliances and up to three preferred appliances
- [x] No-cook option and appliance-filtered inspiration cards
- [x] Optional health details, opt-out clearing and no required measurements
- [x] Versioned V2 session data and review/edit/reset
- [x] New unit and browser tests; check PR #2 for run outcomes
- [ ] Brian/team review of the V2A preview
- [ ] Approval, merge and production rollout of V2A

Implemented is not the same as verified: the PR's latest check run records installation, unit tests, lint, types, production build and desktop/mobile browser results. A green automation run does not substitute for a human visual review.

All prices, retailer rankings, products and savings in V2A are synthetic. No live coupons or store data. The basket is a scaled fixture, not a complete diet-, allergy-, appliance- or nutrition-validated meal plan. Appliance selection affects inspiration cards only. Pantry notes do not reduce cost unless a measured supported quantity was entered.

## V2B - pricing proof of concept

- [ ] Verify the exact target branches around Clemson
- [ ] Find legitimate, reliable store/product price sources
- [ ] Distinguish in-store, pickup and delivery channels and fees
- [ ] Match products and pack sizes with missing-price handling
- [ ] Record source, verified timestamp, availability and deal eligibility
- [ ] Compare a real basket estimate against checkout

Only add live comparisons when those gates are satisfied. A current-looking timestamp must never disguise sample data.

## Subsequent planning and customer validation

- [ ] Full recipe quantities, dietary/allergy constraints and appliance-compatible plans
- [ ] Optional goal-aware planning after the budget workflow is useful
- [ ] Reliable budget repair and personalized swaps
- [ ] Test real grocery use and estimate accuracy, not just stated interest
- [ ] Select a survey collection method and consent/privacy approach

Deferred: accounts/history, payment plans, receipt scanning, retailer checkout, native mobile and clinical nutrition. Supabase and AI integrations remain unconnected.
