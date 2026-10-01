/** V2A contract: budget-first inputs. No calorie or macro prescriptions. */
export const stores = ['walmart', 'publix', 'food_lion', 'aldi'] as const;
export type Store = typeof stores[number];
export const appliances = ['microwave', 'stovetop', 'oven', 'air_fryer', 'grill', 'slow_cooker', 'blender'] as const;
export const allergens = ['Milk', 'Eggs', 'Peanuts', 'Tree nuts', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame'] as const;
export const labels: Record<string, string> = {
  walmart: 'Walmart', publix: 'Publix', food_lion: 'Food Lion', aldi: 'ALDI',
  hard: 'Hard limit', target: 'Target budget', lowest: 'Lowest cost',
  convenience: 'Convenience first', balanced: 'Balanced', maximum: 'Maximum savings',
  single: 'One store only', two: 'Up to two stores', both: 'Show both options',
  microwave: 'Microwave', stovetop: 'Stovetop', oven: 'Oven', air_fryer: 'Air fryer', grill: 'Grill', slow_cooker: 'Slow cooker / Crock-Pot', blender: 'Blender',
  none: 'No specific goal', healthier: 'Eat healthier', muscle: 'Gain muscle', lose: 'Lose weight', maintain: 'Maintain weight',
  any: 'No dietary preference', vegetarian: 'Vegetarian', vegan: 'Vegan', pescatarian: 'Pescatarian', other: 'Other',
  beginner: 'Beginner', intermediate: 'Intermediate', experienced: 'Experienced', yes: 'Yes', no: 'No', flexible: 'Flexible',
  female: 'Female', male: 'Male', prefer_not_to_say: 'Prefer not to say',
  low: 'Mostly seated', light: 'Lightly active', moderate: 'Moderately active', high: 'Very active',
};
export function initialDraft() {
  return {
    budgetStyle: 'hard', budget: '', savingsMode: 'balanced', days: '7', people: '1', meals: '3',
    stores: [] as string[], trip: 'both', location: 'Clemson area',
    diet: 'any', allergyStatus: '', allergens: [] as string[], otherAllergies: '', dislikes: '', restrictions: '', favorites: '',
    pantryOats: '', pantryRice: '', pantryOil: '', pantryNotes: '',
    appliances: [] as string[], preferred: [] as string[], noCook: false, skill: 'beginner', minutes: '30', repeat: 'flexible',
    goal: 'none', nutritionOptIn: false, age: '', sex: '', activity: '', heightCm: '', weightKg: '',
  };
}
export type Draft = ReturnType<typeof initialDraft>;
export type Field = keyof Draft;
export type Errors = Partial<Record<Field, string>>;
export const steps = ['Budget', 'Stores', 'Food & pantry', 'Kitchen', 'Optional goals', 'Review'];
export const fieldsByStep: Field[][] = [
  ['budgetStyle', 'budget', 'savingsMode', 'days', 'people', 'meals'],
  ['stores', 'trip', 'location'],
  ['diet', 'allergyStatus', 'allergens', 'otherAllergies', 'dislikes', 'restrictions', 'favorites', 'pantryOats', 'pantryRice', 'pantryOil', 'pantryNotes'],
  ['appliances', 'preferred', 'noCook', 'skill', 'minutes', 'repeat'],
  ['goal', 'nutritionOptIn', 'age', 'sex', 'activity', 'heightCm', 'weightKg'],
];
export function sampleDraft(): Draft {
  return { ...initialDraft(), budget: '75', stores: [...stores], allergyStatus: 'no', appliances: ['microwave', 'stovetop', 'air_fryer'], preferred: ['microwave'], repeat: 'yes' };
}
function numeric(s: string, min: number, max: number, integer = false) {
  const n = Number(s);
  return /^\d+(\.\d{1,2})?$/.test(s.trim()) && Number.isFinite(n) && n >= min && n <= max && (!integer || Number.isInteger(n));
}
export function validateDraft(d: Draft): Errors {
  const e: Errors = {};
  const choice = (key: Field, values: readonly string[]) => { if (!values.includes(d[key] as string)) e[key] = 'Choose an option.'; };
  choice('budgetStyle', ['hard', 'target', 'lowest']);
  if ((d.budgetStyle !== 'lowest' || d.budget.trim()) && !numeric(d.budget, 1, 5000)) e.budget = 'Enter $1 to $5,000 with at most two decimal places.';
  choice('savingsMode', ['convenience', 'balanced', 'maximum']);
  for (const [key, max] of [['days', 7], ['people', 6], ['meals', 4]] as const) if (!numeric(d[key], 1, max, true)) e[key] = `Choose a whole number from 1 to ${max}.`;
  if (!d.stores.length || d.stores.some(s => !(stores as readonly string[]).includes(s)) || new Set(d.stores).size !== d.stores.length) e.stores = 'Select at least one of the four stores.';
  choice('trip', ['single', 'two', 'both']);
  if (d.location.length > 80) e.location = 'Use a city or ZIP, not a street address (80 characters maximum).';
  choice('diet', ['any', 'vegetarian', 'vegan', 'pescatarian', 'other']);
  choice('allergyStatus', ['yes', 'no']);
  if (d.allergyStatus === 'yes' && !d.allergens.length && !d.otherAllergies.trim()) e.allergens = 'Select an allergy or enter it under Other allergies.';
  if (d.allergens.some(a => !(allergens as readonly string[]).includes(a))) e.allergens = 'Choose a listed allergy or enter it under Other allergies.';
  if (d.diet === 'other' && !d.restrictions.trim()) e.restrictions = 'Describe your dietary preference.';
  for (const key of ['otherAllergies', 'dislikes', 'restrictions', 'favorites', 'pantryNotes'] as const) if (d[key].length > 300) e[key] = 'Use 300 characters or fewer.';
  for (const key of ['pantryOats', 'pantryRice', 'pantryOil'] as const) if (d[key] && !numeric(d[key], 0, 100000)) e[key] = 'Enter 0 to 100,000 in the unit shown.';
  if (!d.noCook && !d.appliances.length) e.appliances = 'Select an appliance or choose a no-cook setup.';
  if (d.appliances.some(a => !(appliances as readonly string[]).includes(a))) e.appliances = 'Choose an appliance from the list.';
  if (d.noCook && (d.appliances.length || d.preferred.length)) e.appliances = 'A no-cook setup must not include appliance requirements.';
  if (d.preferred.length > 3 || new Set(d.preferred).size !== d.preferred.length || d.preferred.some(a => !d.appliances.includes(a))) e.preferred = 'Choose up to three appliances you have access to.';
  choice('skill', ['beginner', 'intermediate', 'experienced']);
  choice('minutes', ['10', '20', '30', '45', '60']);
  choice('repeat', ['yes', 'no', 'flexible']);
  choice('goal', ['none', 'healthier', 'muscle', 'lose', 'maintain']);
  if (d.nutritionOptIn) {
    if (d.age && !numeric(d.age, 18, 100, true)) e.age = 'Optional age must be a whole number from 18 to 100.';
    if (d.heightCm && !numeric(d.heightCm, 100, 250)) e.heightCm = 'Optional height must be 100 to 250 cm.';
    if (d.weightKg && !numeric(d.weightKg, 30, 350)) e.weightKg = 'Optional weight must be 30 to 350 kg.';
    if (d.sex) choice('sex', ['female', 'male', 'prefer_not_to_say']);
    if (d.activity) choice('activity', ['low', 'light', 'moderate', 'high']);
  }
  return e;
}
export function validateStep(d: Draft, step: number): Errors {
  const all = validateDraft(d);
  return step === 5 ? all : Object.fromEntries(Object.entries(all).filter(([key]) => fieldsByStep[step]?.includes(key as Field)));
}
export function updateAppliance(d: Draft, appliance: string, checked: boolean): Draft {
  if (!(appliances as readonly string[]).includes(appliance)) return d;
  const available = checked ? [...new Set([...d.appliances, appliance])] : d.appliances.filter(a => a !== appliance);
  return { ...d, noCook: false, appliances: available, preferred: d.preferred.filter(a => available.includes(a)) };
}
export function withoutNutrition(d: Draft): Draft {
  return { ...d, nutritionOptIn: false, age: '', sex: '', activity: '', heightCm: '', weightKg: '' };
}
export function sanitizeDraft(d: Draft): Draft {
  const clean = d.nutritionOptIn ? { ...d } : withoutNutrition(d);
  return clean.allergyStatus === 'no' ? { ...clean, allergens: [], otherAllergies: '' } : clean;
}
/** Only these non-health fields are consumed by the synthetic cart calculator. */
export function cartSettings(d: Draft) {
  if (Object.keys(validateDraft(d)).length) throw new Error('Invalid V2A profile');
  return {
    budgetStyle: d.budgetStyle, budgetCents: d.budget.trim() ? Math.round(Number(d.budget) * 100) : null,
    savingsMode: d.savingsMode, stores: d.stores as Store[], trip: d.trip,
    days: Number(d.days), people: Number(d.people), meals: Number(d.meals),
    pantry: { oats: Number(d.pantryOats) || 0, rice: Number(d.pantryRice) || 0, oil: Number(d.pantryOil) || 0 },
  };
}
export type CartSettings = ReturnType<typeof cartSettings>;
export const STORAGE_KEY = 'fitcart.budget.v2';
/** Browser data is untrusted; validate shape before values. Ignore old V1 data. */
export function readStoredDraft(raw: string | null): { draft: Draft; completed: boolean } | null {
  if (!raw || raw.length > 20000) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj?.version !== 2 || !obj.draft || typeof obj.completed !== 'boolean') return null;
    const clean = initialDraft();
    for (const key of Object.keys(clean) as Field[]) {
      const value: unknown = obj.draft[key];
      if (key === 'stores' || key === 'allergens' || key === 'appliances' || key === 'preferred') {
        if (!Array.isArray(value) || value.length > 20 || value.some(v => typeof v !== 'string' || v.length > 80)) return null;
        clean[key] = value;
      } else if (key === 'noCook' || key === 'nutritionOptIn') {
        if (typeof value !== 'boolean') return null;
        clean[key] = value;
      } else {
        if (typeof value !== 'string' || value.length > 500) return null;
        clean[key] = value;
      }
    }
    const draft = sanitizeDraft(clean);
    return { draft, completed: obj.completed && !Object.keys(validateDraft(draft)).length };
  } catch { return null; }
}
