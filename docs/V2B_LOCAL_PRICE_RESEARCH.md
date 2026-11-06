# V2B first slice: traceable local price comparisons

Research performed 2026-11-06. This date records source review, NOT a retailer price verification timestamp.

## What is delivered

`/compare` is a functional personal price notebook and comparison calculator. Users can record local shelf, receipt or store-selected website observations, specify comparable products and actual pack sizes, deduct measured pantry stock, compare the same shopping list within one shopping method, and explore an optional two-store combination. Export/import needs no coding and no server upload. Tab persistence is optional. This route never imports synthetic V2A prices.

This is NOT the completed automatic four-retailer feed requested as the longer-term feature. There are zero preloaded verified local quotes. No API key, paid data service, scraping job, retailer integration, cloud database or background refresh was configured. Do not call this real-time pricing or describe personal records as independently verified.

## Branch and deployment

Built on `feature/v2a-budget-first` (e087ef9), because PR #2 is still unmerged. A new PR to main includes that existing work plus this comparison slice. Review the cumulative diff; do not merge PR #2 separately to get this feature. Main remains unchanged until the new PR is approved/merged. Vercel's existing GitHub integration should deploy a branch preview and promote merged main after a successful build. Verify actual checks and deployment status; never infer readiness just from a push.

## Sources checked and decisions

- Walmart #4445: https://www.walmart.com/store/4445-clemson-sc confirms 680 Old Greenville Hwy, Clemson. A store marketing page https://www.walmart.com/store/4445-clemson-sc/baking-supply-store displays product tiles, but does not establish a complete branch-specific in-store quote. A displayed milk tile is 2% HALF gallon, not the whole-gallon product in another source. Do not compare those sticker prices as equivalent.
- Publix #1379: https://www.publix.com/locations/1379-gateway-village confirms 1390 Tiger Blvd, Clemson. The weekly-ad link https://www.publix.com/savings/weekly-ad?nav=secondary_nav_weeklyad returned Bickley Station, Mobile, Alabama in this research session, not Clemson. Discard it as local evidence.
- Publix channel policy: https://delivery.publix.com/store/publix/pages/pricing-policy states pickup/delivery item prices are higher than physical-store prices and subject to delays/errors. Never relabel pickup as shelf price.
- Food Lion: https://stores.foodlion.com/sc/seneca/1085-d-old-clemson-hwy confirms 1085-D Old Clemson Hwy, Seneca 29672. This replaces the earlier unverified store-number assumption. Its weekly-ad link https://foodlion.com/savings/weekly-ad/grid-view did not yield usable local prices. Public product catalog listings alone do not establish prices at this branch.
- ALDI: https://stores.aldi.us/sc/seneca/13190-clemson-blvd redirects to https://www.aldi.us/store/aldi/pages/locator/l/sc/seneca/13190-clemson-boulevard/l950 . The official redirect identifies the candidate branch; the accessible body is a dynamic locator. Confirm the branch in the retailer app. A general whole-milk product page https://www.aldi.us/store/aldi/products/16902710-friendly-farms-vitamin-d-milk-1-gal displays a price but does not prove local branch and shopping method. Not seeded into the calculator.
- ALDI price-channel caveat: https://corporate.aldi.us/newsroom/news/aldi-invests-in-even-lower-prices-this-fall states prices/availability can vary by store and online prices can differ. The advertised reduction period ended Nov 3, before this review. Do not treat that campaign as a current price feed.
- Instacart developer terms: https://docs.instacart.com/developer_platform_api/guide/terms_and_policies/developer_terms/ section 3.5 restricts scraping, certain multi-retailer displays/comparisons and sharing. No Instacart API or storefront-price scraping was implemented. Obtain appropriate permission before any integration; public visibility is not a blanket data license.
- Vercel deployment behavior: https://vercel.com/docs/git/vercel-for-github and https://vercel.com/docs/deployments/promoting-a-deployment describe preview branches and production-branch deployments.
- Candidate for later evaluation ONLY: https://scavio.dev/docs/aldi-search describes an authenticated third-party ALDI store-level API. Vendor claims do not prove retailer authorization, local coverage, correctness or Food Lion/Publix support. No account/key/purchase was made; no adapter silently relies on it.

## Price admission contract

Store key is fixed to the branch displayed. A new branch requires a new identity rather than reusing existing observations. Users must confirm branch/product equivalence; this does not certify accuracy. Currency is integer USD cents. Each record includes exact product/brand, pack quantity, compatible measurement unit, channel, observation date, evidence type, optional official retailer URL, availability and offer conditions. Count quantities are integers; mass/volume units normalize separately. Canned beans use labeled net weight, never a guessed drained yield. Loose bananas use weight pricing; fixed packages round up. Chicken needs actual package total and weight rather than confusing unit price and pack price.

No zero-price fallback, inferred store multipliers, unverified scraper data, forced cheapest ranking or invented discount is allowed. Brian's anecdotal ALDI/Walmart/Food Lion/Publix order is a hypothesis, not a calculation rule. The new route lists store choices alphabetically and ranks complete records by arithmetic only. At least two complete baskets are required for a lowest-price label, and it says incomplete stores could be cheaper. One complete basket may have a total but never wins by default.

Regular observations expire from comparison after seven calendar days (a conservative app policy, not an accuracy guarantee). Sale prices require a valid-through date. Expired/future/out-of-stock/wrong-channel/member-ineligible observations are excluded. A newer unavailable record cannot fall back to an older cheaper record. BOGO, multi-buy, clipped coupons, cashback and basket-level discounts are not supported.

Budget headroom is not actual savings. User-entered tax/fees/travel estimates are separate and default to no charges INCLUDED, not a claim there are none. A two-store suggestion must be complete and lower than the best complete single-store total when one exists; when none exists it makes no savings claim. Each item is assigned once; each visited store's entered charge is counted once. Real travel optimization and exact checkout taxes are not implemented.

## Privacy/security

No personal receipts, private research files or health data enter the repository. The notebook sends no record requests to a server. sessionStorage is opt-in, scoped to `fitcart.local-prices.v1`, and clearable; browser restore may preserve opted-in sessions. Exports contain product/store/date/link data and must not contain personal identifiers or access tokens. Imported JSON has size/count/type/date/unit/domain validation. Imported claims such as verified:true or provider:official are discarded. URLs must use HTTPS on the matching retailer domain and cannot contain credentials or explicit ports. No client-supplied URL is fetched by the server (no SSRF surface).

## Testing and acceptance

37 new local unit tests passed before publishing: units, package rounding, pantry, null/missing prices, dates, channel separation, loyalty, availability, validation, URL safety, imports, ties, non-hardcoded ranking and split trips. New desktop/mobile browser scenarios cover the form, ranking reversals, charges, method/loyalty exclusions, privacy reset and invalid imports. Existing tests are retained, not removed to make checks green. Full app lint/type/build/browser results must come from the latest GitHub Actions run, since this local runtime cannot resolve GitHub/npm.

## What is still needed for automatic comparison

1. Confirm that the selected ALDI and Food Lion branches are Brian's intended ones; the names alone were ambiguous.
2. Obtain a small dated local observation set (same products/method) or a permitted provider feed. Receipt photos shared for review should omit personal/payment details. Do not enter test values into a real comparison.
3. Review product equivalence and exact pack sizes, local channel scope, refresh policy and rights. No central published dataset should be seeded before that review.
4. Add a server-only provider adapter with secrets in Vercel, bounded requests, caching, timeout/rate-limit handling and provider-error tests once credentials and permissions exist. Never ask for secrets to be pasted into chat or committed.
5. Compare estimates with actual checkout and track error before making savings claims.

No additional costs or provider subscriptions were authorized by this implementation.
