import { labels, normalizeProfile, type Draft } from "@/lib/profile";

export function ProfileSummary({ draft }: { draft: Draft }) {
  const p = normalizeProfile(draft);
  const rows = [
    ["Nickname", p.nickname], ["Goal", labels[p.goal]], ["Age", `${p.age}`], ["Sex", labels[p.sex]], ["Activity", labels[p.activity]],
    ["Height", draft.heightUnit === "cm" ? `${draft.heightCm} cm` : `${draft.feet} ft ${draft.inches} in`], ["Weight", `${draft.weight} ${draft.weightUnit}`],
    ["Diet", labels[p.diet]], ["Allergies", p.allergies.join(", ") || "None reported"], ["Other restrictions", p.restrictions || "None reported"], ["Foods to avoid", p.dislikes.join(", ") || "None reported"],
    ["Weekly budget", new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.weeklyBudgetCents / 100)], ["Plan size", `${p.days} days / ${p.mealsPerDay} meals a day / ${p.people} ${p.people === 1 ? "person" : "people"}`],
    ["Preferred store", p.preferredStore || "No preference"], ["City or ZIP", p.location || "Not provided"], ["Cooking skill", labels[p.cookingSkill]], ["Cooking time", `${p.cookingMinutes} minutes per meal`], ["Meal prep", labels[p.mealPrep]], ["Equipment", p.equipment.join(", ") || "Not specified"], ["Favorite foods / cuisines", p.favorites.join(", ") || "Not specified"],
  ];
  return <dl className="summary-grid">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
