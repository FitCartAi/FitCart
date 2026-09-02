const nextMilestones = [
  "Build and validate onboarding",
  "Mock the complete weekly-plan experience",
  "Add structured AI generation",
  "Consolidate groceries and estimate cost",
  "Add budget optimization and meal swaps",
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="flex items-center justify-between border-b border-black/10 pb-5">
          <span className="text-lg font-semibold tracking-tight">FitCart</span>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-black/60">
            MVP foundation
          </span>
        </header>

        <section className="grid gap-10 py-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-black/50">
              Your goals. Your budget. Your grocery list.
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              Stop guessing what to buy this week.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65">
              FitCart is being built to turn a fitness goal, food preferences,
              and a real grocery budget into a practical weekly meal plan and
              consolidated shopping list.
            </p>
          </div>

          <aside className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold">Current build status</p>
            <p className="mt-2 text-2xl font-semibold">Milestone 0</p>
            <p className="mt-2 text-sm leading-6 text-black/60">
              Architecture, repository conventions, and the development shell
              are being established before product features are implemented.
            </p>
          </aside>
        </section>

        <section className="rounded-3xl bg-[#18211b] p-7 text-white sm:p-9">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
                First useful demo
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Profile → plan → cart
              </h2>
              <p className="mt-4 max-w-md leading-7 text-white/65">
                The first vertical slice will let one user enter their basic
                information and receive a believable seven-day plan, grocery
                list, and estimated weekly total.
              </p>
            </div>

            <ol className="space-y-3">
              {nextMilestones.map((milestone, index) => (
                <li
                  key={milestone}
                  className="flex items-start gap-3 border-b border-white/10 pb-3 text-sm text-white/80 last:border-b-0"
                >
                  <span className="font-mono text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{milestone}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <footer className="border-t border-black/10 py-5 text-sm text-black/45">
          FitCart provides general planning estimates and is not a medical
          nutrition service.
        </footer>
      </div>
    </main>
  );
}
