import type { Metadata } from "next";
import Link from "next/link";
import { ProfileProvider } from "@/components/onboarding/profile-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitCart | Budget, fitness, meals, and groceries in one plan",
  description: "FitCart is a classroom MVP exploring one weekly workflow for grocery budgeting, fitness goals, meal planning, and grocery planning.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ProfileProvider>
          <a className="skip-link" href="#content">Skip to content</a>
          <header className="site-header">
            <div className="container header-inner">
              <Link className="brand" href="/" aria-label="FitCart home">
                <span className="brand-mark" aria-hidden="true">FC</span>
                <span>FitCart</span>
                <span className="beta">PROTOTYPE</span>
              </Link>
              <nav aria-label="Main navigation">
                <Link href="/onboarding">Build My Cart</Link>
                <Link href="/demo">Sample</Link>
                <Link href="/feedback">Feedback</Link>
              </nav>
            </div>
          </header>
          <div id="content">{children}</div>
          <footer className="container site-footer">
            <span>FitCart &middot; Budget + fitness + meal planning + groceries.</span>
            <span>Classroom prototype. Not medical advice.</span>
          </footer>
        </ProfileProvider>
      </body>
    </html>
  );
}
