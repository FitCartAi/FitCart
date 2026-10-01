# Review FitCart V2A in your browser

This version puts budgeting first. Nothing needs to be downloaded or installed on your computer.

## Review the new version

Open the V2A pull request in GitHub. Use the **Preview / Visit Preview** link from Vercel's deployment comment when it appears. It is a preview, not the production site. Sign into your Vercel/GitHub account if preview protection asks; do not disable protection or change billing just to test.

On the preview, choose **Compare my cart**, then **Use sample answers**. Go through Budget, Stores, Food & pantry, Kitchen, Optional goals, and Review. Accept the sample-data notice and select **Compare sample cart**. **Explore a sample** on the homepage skips setup.

Try a $1 hard limit, a blank amount in Lowest Cost mode, one-store-only shopping, a pantry amount, and removing an appliance after marking it preferred. Try a sample brand swap and undo it. No body measurements or API keys are required.

All retailer prices, rankings, and savings are fictional. The store comparison is a prototype, not actual local price research. Appliance choices affect sample inspiration only, not a complete dietary plan. Feedback still needs to be copied and sent to the team manually.

## Before merging

Check that **Verify FitCart** has passed on the latest commit and that Vercel's preview is ready. Review the screens with Brian. Do not merge until approved: merging to main will update the live site.

## Codespaces fallback

Use the `feature/v2a-budget-first` branch, then **Code > Codespaces > Create codespace**. The cloud computer installs dependencies and starts port 3000. Open **Ports > 3000 > Open in Browser**. Existing workspaces do not automatically receive new commits just because a preview page is refreshed. Do not delete an old workspace with uncommitted work. GitHub usage/billing limits apply.

When finished, clear V2 answers, close the preview, sign out on a shared computer, and stop the Codespace. Stopping does not delete stored files.

## Technical notes

See `docs/V2A_BUDGET_FIRST.md` for boundaries, file organization and V2B requirements. New components live in `src/components/budget`, new contracts/calculations in `src/lib/v2`, and the new route pages in `src/app/budget`, `cart`, and `sample`. The old V1 routes remain for compatibility. No manual file placement is needed.
