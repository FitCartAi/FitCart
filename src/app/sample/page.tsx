import { BudgetCart } from '@/components/budget/cart';
import { sampleDraft } from '@/lib/v2/profile';
export default function SamplePage() { return <BudgetCart draft={sampleDraft()} sample />; }
