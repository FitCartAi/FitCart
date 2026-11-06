# FitCart

**Plan your week. Compare your cart. Spend less.**

Budget-first grocery-planning classroom prototype. V2A is a review branch using **invented prices**; it is not a live retailer comparison or personalized nutrition service.

## Try it without installing anything

Read [START_HERE.md](START_HERE.md). Open Pull Request #2 and use Vercel's Preview link after the deployment is ready. A preview is separate from the current production site. Review before merging.

## Current routes

| Route | Purpose |
| --- | --- |
| `/` | Budget-first landing page |
| `/budget` | Budget, stores, food/pantry, kitchen, optional goals and review |
| `/cart` | Synthetic comparison using a completed V2 setup |
| `/sample` | Synthetic sample profile and comparison |
| `/feedback` | Copy-and-send prototype feedback; no survey backend |
| `/onboarding`, `/plan`, `/demo` | Retained V1 screens for compatibility |

The calculator uses selected stores, plan size, budget, savings mode and measured pantry amounts. Appliance preferences filter sample inspiration; the full basket does not yet follow diet/allergy/appliance restrictions. No body measurements are required. Every store price and saving is fictional, with no verified price date. No retailer, AI or database integration is connected.

Profiles stay in memory unless tab storage is explicitly enabled. Turning nutrition off clears optional body details. Use sample inputs on shared computers and clear answers before leaving.

## Development and verification

The existing stack and dependency versions are unchanged. In a development environment, `npm run check` runs unit tests, lint, types and the production build. `npm run test:e2e` runs browser scenarios against the build. GitHub Actions runs these checks for the PR. See the latest commit's results rather than treating written tests as passed tests.

No package lockfile is added in this change: the local runtime could not reach npm. Review and commit a generated lockfile from a successful installation in a separate maintenance change. Do not synthesize one.

## Documentation

- [V2A scope, calculations and limitations](docs/V2A_BUDGET_FIRST.md)
- [Decision log](docs/DECISIONS.md)
- [Roadmap](docs/MVP_ROADMAP.md)
- [Original product context](docs/PRODUCT_CONTEXT.md)
- [Architecture](docs/ARCHITECTURE.md)

Use feature branches and PRs. Never commit credentials, real user profiles, raw survey responses, private charter materials, or generated browser reports.
