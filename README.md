# FitCart

**Your goals. Your budget. Your grocery list.**

FitCart is a classroom venture exploring personalized grocery planning. This branch implements onboarding plus a clearly labeled fixed sample week, not personalized nutrition advice.

## Start in your browser

Read [START_HERE.md](START_HERE.md). The **feature/onboarding-preview** branch includes a Codespaces configuration to install dependencies and start a preview on port 3000. No local PowerShell, API key, database or hosting account is needed. GitHub usage limits apply.

## Current implementation

| Route | Purpose |
| --- | --- |
| / | Landing page and prototype status |
| /onboarding | Four questionnaire sections and review |
| /plan | Completed profile summary, editing and reset |
| /demo | Fixed sample week, preset lunch swaps and grocery checklist |

Validation, imperial/metric conversion, optional per-tab storage and sample grocery arithmetic are implemented. Form answers stay in page memory unless users opt into browser session storage. They are not sent to a server. Use sample answers on shared computers.

**Not implemented:** personalized AI generation, nutrition targets, live store prices, allergy-safe meal selection, accounts, automatic budget optimization or survey collection. All sample prices are fictional; the sample does not use the questionnaire.

## Verification

27 unit tests passed during implementation; the two domain modules passed strict TypeScript checks. Full application lint, typecheck, production build and desktop/mobile browser checks are configured in .github/workflows/verify.yml but require a successful GitHub run. Check the pull request before merging. A real Codespaces startup has not yet been verified.

For developers in the cloud workspace: npm test; npm run check; then npx playwright install chromium and npm run test:e2e. Browser tests use the production build. Node 22 is configured. Review and commit the generated package-lock.json after the first successful installation, then switch CI to npm ci. No lockfile is claimed to exist yet.

## Documentation

- [Product context](docs/PRODUCT_CONTEXT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Decision log](docs/DECISIONS.md)
- [Implementation decisions and file map](docs/ONBOARDING_IMPLEMENTATION.md)
- [MVP roadmap](docs/MVP_ROADMAP.md)

Use feature branches and pull requests. Never commit secrets, .env.local, user measurements, survey responses, private team documents or generated browser reports. Keep implemented, mocked and planned features distinct.
