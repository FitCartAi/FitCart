# Tests

FitCart should prioritize tests for deterministic logic and product-critical constraints.

Planned structure:

- `unit/` — calculations, units, grocery consolidation, totals, validators
- `integration/` — end-to-end service flows without browser automation
- `fixtures/` — fixed user profiles and expected structural constraints

AI tests should use fixed profiles and validate constraints such as structure, meal count, allergies/restrictions, and obviously implausible quantities rather than expecting identical prose.