/** Shared browser/server contract. No nutrition targets are calculated here. */
export const goals = ["gain_muscle", "lose_weight", "maintain_weight", "eat_healthier"] as const;
export const activities = ["low", "light", "moderate", "high"] as const;
export const diets = ["no_preference", "vegetarian", "vegan", "pescatarian", "other"] as const;
export const allergyChoices = ["Milk", "Eggs", "Peanuts", "Tree nuts", "Soy", "Wheat", "Fish", "Shellfish", "Sesame"] as const;
export const equipmentChoices = ["Stove", "Oven", "Microwave", "Air fryer", "Blender"] as const;
export const labels: Record<string, string> = {
  gain_muscle: "Gain muscle", lose_weight: "Lose weight", maintain_weight: "Maintain weight", eat_healthier: "Eat healthier",
  low: "Mostly seated", light: "Lightly active", moderate: "Moderately active", high: "Very active",
  no_preference: "No dietary preference", vegetarian: "Vegetarian", vegan: "Vegan", pescatarian: "Pescatarian", other: "Other",
  female: "Female", male: "Male", prefer_not_to_say: "Prefer not to say",
  imperial: "Feet and inches", cm: "Centimeters", lb: "Pounds (lb)", kg: "Kilograms (kg)",
  beginner: "Beginner", intermediate: "Intermediate", experienced: "Experienced",
  yes: "Yes", no: "No", flexible: "Flexible",
};
export type Draft = {
  nickname: string; goal: string; age: string; sex: string; activity: string;
  heightUnit: string; heightCm: string; feet: string; inches: string; weightUnit: string; weight: string;
  diet: string; allergyStatus: string; allergens: string[]; otherAllergies: string; restrictions: string; dislikes: string;
  budget: string; days: string; meals: string; people: string; store: string; location: string;
  skill: string; minutes: string; mealPrep: string; equipment: string[]; favorites: string;
};
export type Field = keyof Draft;
export type Errors = Partial<Record<Field, string>>;
export type UserProfile = {
  version: 1; nickname: string; age: number; sex: "female" | "male" | "prefer_not_to_say";
  goal: typeof goals[number]; activity: typeof activities[number]; heightCm: number; weightKg: number;
  diet: typeof diets[number]; allergies: string[]; restrictions: string; dislikes: string[];
  weeklyBudgetCents: number; days: number; mealsPerDay: number; people: number;
  preferredStore: string | null; location: string | null; cookingSkill: string; cookingMinutes: number;
  mealPrep: string; equipment: string[]; favorites: string[];
};
export function emptyDraft(): Draft {
  return { nickname: "", goal: "", age: "", sex: "", activity: "", heightUnit: "imperial", heightCm: "", feet: "", inches: "", weightUnit: "lb", weight: "", diet: "no_preference", allergyStatus: "", allergens: [], otherAllergies: "", restrictions: "", dislikes: "", budget: "", days: "7", meals: "3", people: "1", store: "", location: "", skill: "beginner", minutes: "30", mealPrep: "flexible", equipment: [], favorites: "" };
}
export function sampleDraft(): Draft {
  return { ...emptyDraft(), nickname: "Alex (sample)", goal: "gain_muscle", age: "21", sex: "prefer_not_to_say", activity: "moderate", feet: "5", inches: "9", weight: "140", allergyStatus: "no", dislikes: "mushrooms", budget: "85", store: "Publix", location: "Clemson", mealPrep: "yes", equipment: ["Stove", "Air fryer"], favorites: "tacos, spicy food, chicken" };
}
export const stepFields: Field[][] = [
  ["nickname", "goal", "age", "sex", "activity", "heightUnit", "heightCm", "feet", "inches", "weightUnit", "weight"],
  ["diet", "allergyStatus", "allergens", "otherAllergies", "restrictions", "dislikes"],
  ["budget", "days", "meals", "people", "store", "location"],
  ["skill", "minutes", "mealPrep", "equipment", "favorites"],
];
function isNumber(value: string, min: number, max: number, integer = false) {
  if (!/^\d+(\.\d+)?$/.test(value.trim())) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max && (!integer || Number.isInteger(n));
}
export function splitFoods(value: string): string[] {
  return [...new Set(value.split(/[,;\n]/).map(s => s.trim().toLowerCase()).filter(Boolean))];
}
export function validateDraft(d: Draft): Errors {
  const e: Errors = {};
  const choice = (key: Field, values: readonly string[]) => { if (!values.includes(d[key] as string)) e[key] = "Choose an option."; };
  if (!d.nickname.trim() || d.nickname.trim().length > 40) e.nickname = "Enter a nickname of 1 to 40 characters.";
  choice("goal", goals);
  if (!isNumber(d.age, 18, 100, true)) e.age = "This adult prototype accepts ages 18 to 100. Use sample answers for a classroom demo.";
  choice("sex", ["female", "male", "prefer_not_to_say"]);
  choice("activity", activities);
  choice("heightUnit", ["imperial", "cm"]);
  if (d.heightUnit === "cm" && !isNumber(d.heightCm, 100, 250)) e.heightCm = "Enter a height from 100 to 250 cm for this prototype.";
  if (d.heightUnit === "imperial") {
    if (!isNumber(d.feet, 3, 8, true)) e.feet = "Enter whole feet from 3 to 8.";
    if (!isNumber(d.inches, 0, 11.99)) e.inches = "Enter inches from 0 to less than 12.";
    const cm = (Number(d.feet) * 12 + Number(d.inches)) * 2.54;
    if (!e.feet && !e.inches && (cm < 100 || cm > 250)) e.feet = "Check your height; this prototype supports 100 to 250 cm.";
  }
  choice("weightUnit", ["lb", "kg"]);
  const kg = Number(d.weight) * (d.weightUnit === "lb" ? 0.45359237 : 1);
  if (!isNumber(d.weight, 1, 2000) || kg < 30 || kg > 350) e.weight = "Check your weight and unit; this prototype supports 30 to 350 kg (about 67 to 771 lb).";
  choice("diet", diets);
  choice("allergyStatus", ["yes", "no"]);
  if (d.allergens.some(a => !(allergyChoices as readonly string[]).includes(a))) e.allergens = "Choose an allergy from the list or enter it under other allergies.";
  if (d.allergyStatus === "yes" && !d.allergens.length && !d.otherAllergies.trim()) e.allergens = "Select an allergy or describe it below.";
  if (d.diet === "other" && !d.restrictions.trim()) e.restrictions = "Describe your dietary preference or restriction.";
  for (const key of ["otherAllergies", "restrictions", "dislikes", "favorites"] as const) if (d[key].length > 300) e[key] = "Use no more than 300 characters.";
  if (!/^\d+(\.\d{1,2})?$/.test(d.budget.trim()) || !isNumber(d.budget, 1, 5000)) e.budget = "Enter a weekly budget from $1 to $5,000, with at most two decimal places.";
  for (const [key, max] of [["days", 7], ["meals", 4], ["people", 6]] as const) if (!isNumber(d[key], 1, max, true)) e[key] = `Choose a whole number from 1 to ${max}.`;
  if (d.store.length > 80) e.store = "Use no more than 80 characters.";
  if (d.location.length > 80) e.location = "Enter a city or ZIP, not a full address (80 characters maximum).";
  choice("skill", ["beginner", "intermediate", "experienced"]);
  choice("minutes", ["10", "20", "30", "45", "60"]);
  choice("mealPrep", ["yes", "no", "flexible"]);
  if (d.equipment.some(a => !(equipmentChoices as readonly string[]).includes(a))) e.equipment = "Choose equipment from the list.";
  return e;
}
export function validateStep(d: Draft, step: number): Errors {
  const all = validateDraft(d);
  return Object.fromEntries(Object.entries(all).filter(([key]) => stepFields[step]?.includes(key as Field)));
}
export function normalizeProfile(d: Draft): UserProfile {
  if (Object.keys(validateDraft(d)).length) throw new Error("Profile contains invalid fields.");
  const round = (n: number) => Math.round(n * 100) / 100;
  return { version: 1, nickname: d.nickname.trim(), age: Number(d.age), sex: d.sex as UserProfile["sex"], goal: d.goal as UserProfile["goal"], activity: d.activity as UserProfile["activity"], heightCm: round(d.heightUnit === "cm" ? Number(d.heightCm) : (Number(d.feet) * 12 + Number(d.inches)) * 2.54), weightKg: round(Number(d.weight) * (d.weightUnit === "lb" ? 0.45359237 : 1)), diet: d.diet as UserProfile["diet"], allergies: d.allergyStatus === "yes" ? [...new Set([...d.allergens.map(a => a.toLowerCase()), ...splitFoods(d.otherAllergies)])] : [], restrictions: d.restrictions.trim(), dislikes: splitFoods(d.dislikes), weeklyBudgetCents: Math.round(Number(d.budget) * 100), days: Number(d.days), mealsPerDay: Number(d.meals), people: Number(d.people), preferredStore: d.store.trim() || null, location: d.location.trim() || null, cookingSkill: d.skill, cookingMinutes: Number(d.minutes), mealPrep: d.mealPrep, equipment: [...new Set(d.equipment)], favorites: splitFoods(d.favorites) };
}
/** Treat browser storage as untrusted. Pick only known keys and bound payload size. */
export function readStoredDraft(raw: string | null): { draft: Draft; completed: boolean } | null {
  if (!raw || raw.length > 15000) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj?.version !== 1 || !obj.draft || typeof obj.completed !== "boolean") return null;
    const clean = emptyDraft();
    for (const key of Object.keys(clean) as Field[]) {
      const value = obj.draft[key];
      if (key === "allergens" || key === "equipment") {
        if (!Array.isArray(value) || value.length > 20 || value.some(v => typeof v !== "string" || v.length > 100)) return null;
        clean[key] = value;
      } else {
        if (typeof value !== "string" || value.length > 500) return null;
        clean[key] = value;
      }
    }
    return { draft: clean, completed: obj.completed && Object.keys(validateDraft(clean)).length === 0 };
  } catch { return null; }
}
