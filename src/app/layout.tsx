import type { Metadata } from "next";
import Link from "next/link";
import { ProfileProvider } from "@/components/onboarding/profile-provider";
import "./globals.css";

export const metadata: Metadata = { title: "FitCart | Your goals. Your budget.", description: "FitCart classroom prototype: test the onboarding experience and explore a clearly labeled sample grocery plan.", robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ProfileProvider><a className="skip-link" href="#content">Skip to content</a><header className="site-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="FitCart home"><span className="brand-mark" aria-hidden="true">F</span>FitCart<span className="beta">PROTOTYPE</span></Link><nav aria-label="Main navigation"><Link href="/onboarding">Build My Cart</Link><Link href="/demo">Sample preview</Link></nav></div></header><div id="content">{children}</div><footer className="container site-footer"><span>FitCart &middot; Your goals. Your budget. Your grocery list.</span><span>Classroom prototype. Not medical advice.</span></footer></ProfileProvider></body></html>;
}
