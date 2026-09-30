# Start here: FitCart without installing anything

The new code is on **feature/onboarding-preview** in **FitCartAi/FitCart**. A branch is a separate working version. You do not need to upload or move files; all new files are already in their correct locations. Main stays unchanged until the pull request is merged.

## Open it in your browser

1. Open the FitCart repository on GitHub. Above the file list, select **feature/onboarding-preview** from the branch dropdown.
2. Click the green **Code** button, choose **Codespaces**, and create a codespace on this branch. Review GitHub's usage/billing message first. Use the smallest available machine; stop rather than entering payment details if you are unsure.
3. Wait for cloud setup. The included configuration is set to install dependencies and start the preview automatically on GitHub's cloud computer, not yours. No local terminal, AI key or Supabase account is required.
4. Choose **Open in Browser** for the preview. If a tab does not open, select the **Ports** panel at the bottom, find **3000 / FitCart preview**, and click the globe icon. Keep the port private. A first load may require a refresh while the app finishes starting.
5. Choose **Build My Cart**, then **Use sample answers**. Continue through the four questionnaire sections and review screen. After confirmation, open **Explore fixed sample**.

A fresh codespace from this branch is simpler than updating an old workspace. Do not delete an old codespace with uncommitted work. If installation fails or port 3000 never opens, share the error text or a screenshot with the development assistant. Do not share tokens or passwords, and do not try random commands.

## What to try

Test whether the questions are clear, whether Back and Edit preserve your answers, and whether the review matches your inputs. In the fixed sample, swap a lunch, watch quantities and fictional totals update, check off an item, and find the print button.

The sample is always one person, seven days, three meals per day and an $85 example budget. Its prices are fictional. It does not use your answers, screen allergies or assess nutrition. It is for interface feedback, not shopping advice. No personalized AI generation or survey collection is connected.

## Shared computers and cloud usage

Use sample answers for the first test. Remembering answers in this tab is off by default. Without that option, refreshing clears the profile. With it, browser session storage survives refreshes and may survive session restore. Use **Forget my answers** before leaving, close the preview tab, and sign out of GitHub.

When finished, open **Your codespaces** on GitHub and use the three-dot menu to **Stop codespace**. Closing a browser does not immediately stop compute use. A stopped codespace still uses storage. Delete it only when needed work is committed. GitHub's usage allowances and billing settings apply.

## Verification

All 27 dependency-free unit tests passed in the implementation environment. The two domain modules passed strict TypeScript checks; all 11 application TS/TSX files passed syntax checks. Full Next.js compilation, lint, application-wide type checking, browser interaction tests and Codespaces startup require the GitHub checks or cloud preview: the implementation runtime could not reach npm. See the pull request's latest **Checks** before merging. Configuring a test is not the same as passing it.

## Where the files live

The repository root is the screen containing package.json and README.md. The questionnaire is under src/components/onboarding, its page is src/app/onboarding/page.tsx, and the sample page is src/app/demo/page.tsx. Supporting paths and decisions are in docs/ONBOARDING_IMPLEMENTATION.md. You do not need to edit any of them to test the app.

## Official help

- [Create a codespace on a branch](https://docs.github.com/en/codespaces/developing-in-a-codespace/creating-a-codespace-for-a-repository)
- [Open a forwarded port](https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace)
- [Usage and billing](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces)
- [Conserve included usage](https://docs.github.com/en/codespaces/troubleshooting/troubleshooting-included-usage)
