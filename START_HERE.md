# FitCart: local-price comparison preview

No file uploads into GitHub, local commands, PowerShell or new software installation are needed.

## Review the new feature

Open the newest pull request for `feature/local-price-comparison`. In its Conversation tab, find Vercel's deployment comment and choose **Preview**, then **Local prices**. Vercel may ask you to sign into your existing account. Wait for GitHub checks and the Vercel deployment to finish before merging.

This branch also includes the approved budget-first V2A code from the still-open PR #2. Review this cumulative version, not the old fitness-first main site. Do not merge PR #2 separately just to get the price feature.

## What the new page actually does

It compares your own dated price observations for a small list of groceries at four specific local branches. Add prices using the browser form; no coding. It checks whole-package quantities, pantry stock, expiry, shopping method and loyalty requirements. Export/import lets you share observations with teammates. They are personal observations, not certified quotes.

**No automatic retailer feed is connected and no researched prices are preloaded.** Public pages did not establish a reliable local basket across all four stores. An incomplete basket stays incomplete, rather than being filled with guessed prices. The existing Sample cart is explicitly fictional and remains separate.

Choose your actual branch and shopping method when researching prices. Record an exact package price and size. Do not type a per-pound chicken price into the package-price field. General web-search prices do not prove local shelf prices.

## After review

Merging the new PR into main should trigger the existing Vercel production deployment. There is no need to create another Vercel project. A deployment marked Ready is not a statement that retailer integrations exist. There are no new environment variables or API keys for this slice.

For automatic prices, the next requirement is a permitted, branch-specific data source; see `docs/V2B_LOCAL_PRICE_RESEARCH.md`. No paid provider has been connected or purchased.
