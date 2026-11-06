import type { Metadata } from 'next';
import Link from 'next/link';
import { ProfileProvider } from '@/components/onboarding/profile-provider';
import { BudgetProvider } from '@/components/budget/provider';
import './globals.css';
import './v2.css';
import './pricing.css';
export const metadata: Metadata = {
  title: 'FitCart | Plan your week. Compare your cart. Spend less.',
  description: 'Budget-first grocery planning. Record local price observations and compare whole-package costs. Separate sample carts use fictional prices; no live retailer feed is connected.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ProfileProvider><BudgetProvider>
    <a className="skip-link" href="#content">Skip to content</a>
    <header className="site-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="FitCart home"><span className="brand-mark" aria-hidden="true">FC</span><span>FitCart</span><span className="beta">RESEARCH PREVIEW</span></Link><nav aria-label="Main navigation"><Link href="/budget">My budget</Link><Link href="/compare">Local prices</Link><Link href="/sample">Sample cart</Link><Link href="/feedback">Feedback</Link></nav></div></header>
    <div id="content">{children}</div>
    <footer className="container site-footer"><span>FitCart / Budget first. Food that fits your life.</span><span>Local notes are user-entered. Sample carts are fictional. No live feed.</span></footer>
  </BudgetProvider></ProfileProvider></body></html>;
}
