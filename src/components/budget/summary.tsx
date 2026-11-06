import { labels, type Draft } from '@/lib/v2/profile';
export function BudgetSummary({ draft: d }: { draft: Draft }) {
  const list = (values: string[]) => values.map(s => labels[s] ?? s).join(', ');
  const rows = [
    ['Budget', `${d.budget ? '$' + Number(d.budget).toFixed(2) : 'No cap set'} / ${labels[d.budgetStyle]}`],
    ['Plan size', `${d.days} days / ${d.people} people / ${d.meals} meals per day`],
    ['Savings mode', labels[d.savingsMode]], ['Shopping', labels[d.trip]],
    ['Selected retailers', list(d.stores)], ['Area', d.location || 'Clemson area'],
    ['Diet', labels[d.diet]], ['Reported allergies', d.allergyStatus === 'no' ? 'None reported' : [...d.allergens, d.otherAllergies].filter(Boolean).join(', ')],
    ['Restrictions / dislikes', [d.restrictions, d.dislikes].filter(Boolean).join('; ') || 'None entered'],
    ['Pantry stock', `Oats ${d.pantryOats || 0} g / dry rice ${d.pantryRice || 0} g / oil ${d.pantryOil || 0} ml`],
    ['Other pantry notes', d.pantryNotes || 'None entered'],
    ['Appliances available', d.noCook ? 'No-cook only' : list(d.appliances)],
    ['Preferred appliances', d.noCook ? 'No-cook only' : list(d.preferred) || 'No preference'],
    ['Cooking', `${labels[d.skill]} / ${d.minutes} minutes / repeat meals: ${labels[d.repeat]}`],
    ['Favorite foods', d.favorites || 'None entered'], ['Optional goal', labels[d.goal]],
  ];
  if (d.nutritionOptIn) rows.push(['Optional details (not used for estimates)', [d.age && `${d.age} years`, d.sex && labels[d.sex], d.activity && labels[d.activity], d.heightCm && `${d.heightCm} cm`, d.weightKg && `${d.weightKg} kg`].filter(Boolean).join(' / ') || 'No details entered']);
  return <dl className="summary-grid">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
