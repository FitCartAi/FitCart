'use client';
import Link from 'next/link';
import { BudgetCart } from '@/components/budget/cart';
import { useBudget } from '@/components/budget/provider';
import { validateDraft } from '@/lib/v2/profile';
export default function CartPage() {
  const { draft, ready, completed } = useBudget();
  if (!ready) return <main className="container page-space"><p role="status">Opening your example cart...</p></main>;
  if (!completed || Object.keys(validateDraft(draft)).length) return <main className="container page-space narrow"><section className="panel"><h1>Start with your budget.</h1><p>No completed V2 setup in this tab. Memory-only answers clear on refresh.</p><div className="hero-actions"><Link className="button primary" href="/budget">Set up my budget</Link><Link className="button secondary" href="/sample">Explore a sample scenario</Link></div></section></main>;
  return <BudgetCart draft={draft} />;
}
