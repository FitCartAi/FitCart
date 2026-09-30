# Onboarding implementation - 2026-09-17

## Scope

Implement the approved guest questionnaire and fixed results preview in the existing single Next.js app. No AI, retailer, database or hosting integration is connected. Only synthetic examples are added to the public repository, not private charter details or real user records.

## Decisions

### Memory first; browser-tab storage with opt-in

A root client provider preserves drafts through internal navigation. The explicit remember checkbox enables sessionStorage under fitcart.onboarding.v1. There is no localStorage, profile query string, tracking endpoint or server persistence. Stored JSON is size-limited, shape-checked and revalidated before completion is accepted. Clear resets memory and attempts to remove the stored key; storage failures produce a notice. Browser settings and session restore remain outside the app's control. Revisit when accounts need server authorization, retention and deletion controls.

### One shared profile contract

src/lib/profile.ts contains the typed draft/profile contract, option lists, validation, normalization and storage parsing. Future API endpoints must parse and validate requests independently; client validation is not a security boundary. Money is integer cents. Measurements normalize to centimeters and kilograms. The entered budget is a full-week household budget, even for a shorter planning window; no silent proration occurs. Adult age and measurement bounds are prototype input limits, not clinical criteria. Sex includes prefer-not-to-say. No calorie, macro or medical-risk methodology is implemented.

### Separate profile confirmation from fixed meals

/plan displays the completed profile. /demo does not read that profile: it is explicitly one person, seven days, three meals per day and an $85 example budget. This prevents implying that a fixed fixture honors allergies, goals or household size. Nutrition targets and a personalized explanation are deliberately absent until methodology and actual personalization are validated. The complete original results milestone is not finished merely because screens exist.

### Sample grocery mathematics

src/lib/demo-plan.ts contains a small fictional catalog and pure calculations. Ingredient IDs, preparation states and units are fixed. Quantities combine by ID; purchases round up to full packs; pantry staples cost full packages; leftovers and meal references are visible. Taxes and fees are excluded. A preset lunch switch recalculates the sample and clears checked items. This is not a general optimizer, product matcher or allergy validator.

### Browser-first setup

.devcontainer/devcontainer.json installs packages in Codespaces and runs scripts/start-preview.mjs on cloud startup. Port 3000 is forwarded and labeled. The owner chooses whether to create a codespace and use their GitHub allowance. No paid service is created. The GitHub Actions workflow adds integration checks without deployment or secrets.

## File map

| Path | Purpose |
| --- | --- |
| src/app/page.tsx | Home page |
| src/app/layout.tsx | Shared navigation and profile provider |
| src/app/globals.css | Responsive styling and printing |
| src/app/onboarding/page.tsx | Questionnaire route |
| src/app/plan/page.tsx | Profile summary route |
| src/app/demo/page.tsx | Fixed sample route |
| src/components/onboarding/onboarding-form.tsx | Sections, inputs and review |
| src/components/onboarding/profile-provider.tsx | Draft memory, opt-in storage and reset |
| src/components/onboarding/profile-summary.tsx | Validated profile display |
| src/components/demo-results.tsx | Sample meals, swaps and grocery checklist |
| src/lib/profile.ts | Profile types and validation |
| src/lib/demo-plan.ts | Fictional fixture and calculations |
| tests/unit/ | 27 tests |
| tests/e2e/onboarding.spec.mjs | Six flows on desktop and mobile Chromium |
| playwright.config.mjs | Browser-test setup |
| .devcontainer/devcontainer.json | Cloud workspace setup |
| scripts/start-preview.mjs | Cloud preview process |
| .github/workflows/verify.yml | App checks, no deployment |
| START_HERE.md | Browser-only instructions |

## Verification and remaining work

27 unit tests passed, the two domain modules strictly typechecked, and 11 TS/TSX files syntax-checked during implementation. The runtime could not install npm dependencies, so framework compilation, lint, app-wide types, browser tests and cloud startup were not verified there. The browser tests are written, not evidence of passing. Read the pull request's latest Checks before merging.

After a successful install, commit the generated dependency lockfile and switch CI to npm ci. Review the actual screens on desktop and mobile. Collect feedback on question clarity, editing and list layout, not claimed personalization or live price accuracy. Document nutrition/safety requirements and a structured server-side planning service before generating real recommendations.
