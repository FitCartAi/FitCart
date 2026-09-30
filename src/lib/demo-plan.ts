/** Fictional fixture for UI testing only. Never treat these prices as retailer quotes. */
type Item = { name: string; category: string; unit: "g" | "ml" | "each"; packSize: number; packLabel: string; priceCents: number };
export const catalog: Record<string, Item> = {
  oats: { name: "Rolled oats (dry)", category: "Grains & pantry", unit: "g", packSize: 1000, packLabel: "1 kg bag", priceCents: 399 },
  milk: { name: "Milk", category: "Dairy & eggs", unit: "ml", packSize: 1893, packLabel: "half-gallon carton", priceCents: 329 },
  banana: { name: "Bananas", category: "Produce", unit: "each", packSize: 1, packLabel: "individual banana", priceCents: 35 },
  yogurt: { name: "Plain Greek yogurt", category: "Dairy & eggs", unit: "g", packSize: 907, packLabel: "907 g tub", priceCents: 449 },
  berries: { name: "Frozen berries", category: "Frozen", unit: "g", packSize: 340, packLabel: "340 g bag", priceCents: 349 },
  eggs: { name: "Eggs", category: "Dairy & eggs", unit: "each", packSize: 12, packLabel: "dozen", priceCents: 249 },
  bread: { name: "Whole-wheat bread (slices)", category: "Grains & pantry", unit: "each", packSize: 20, packLabel: "20-slice loaf", priceCents: 249 },
  chicken: { name: "Chicken breast (raw)", category: "Meat", unit: "g", packSize: 454, packLabel: "454 g pack", priceCents: 599 },
  rice: { name: "Rice (dry)", category: "Grains & pantry", unit: "g", packSize: 1000, packLabel: "1 kg bag", priceCents: 249 },
  broccoli: { name: "Frozen broccoli", category: "Frozen", unit: "g", packSize: 340, packLabel: "340 g bag", priceCents: 149 },
  beans: { name: "Black beans (drained)", category: "Grains & pantry", unit: "g", packSize: 255, packLabel: "can with 255 g drained beans", priceCents: 89 },
  turkey: { name: "Ground turkey (raw)", category: "Meat", unit: "g", packSize: 454, packLabel: "454 g pack", priceCents: 449 },
  tortillas: { name: "Tortillas", category: "Grains & pantry", unit: "each", packSize: 10, packLabel: "10-count pack", priceCents: 199 },
  oil: { name: "Olive oil", category: "Grains & pantry", unit: "ml", packSize: 500, packLabel: "500 ml bottle", priceCents: 449 },
  seasoning: { name: "Taco seasoning", category: "Grains & pantry", unit: "g", packSize: 28, packLabel: "28 g packet", priceCents: 79 },
};
type Recipe = { name: string; items: [string, number][] };
export const recipes: Record<string, Recipe> = {
  oats: { name: "Banana overnight oats", items: [["oats", 70], ["milk", 200], ["banana", 1]] },
  yogurt: { name: "Yogurt & berry bowl", items: [["yogurt", 200], ["oats", 40], ["berries", 100]] },
  eggs: { name: "Eggs on toast", items: [["eggs", 2], ["bread", 2], ["oil", 5]] },
  chicken: { name: "Chicken, rice & broccoli", items: [["chicken", 160], ["rice", 75], ["broccoli", 120], ["oil", 10]] },
  beans: { name: "Black bean rice bowl", items: [["beans", 130], ["rice", 75], ["broccoli", 120], ["oil", 10]] },
  turkey: { name: "Turkey taco wraps", items: [["turkey", 160], ["tortillas", 2], ["broccoli", 100], ["oil", 10], ["seasoning", 5]] },
};
export type DemoDay = { breakfast: string; lunch: string; dinner: string };
export function makeDemoSchedule(): DemoDay[] {
  return Array.from({ length: 7 }, (_, i) => ({ breakfast: ["oats", "yogurt", "eggs"][i % 3], lunch: i % 2 ? "beans" : "chicken", dinner: ["turkey", "beans", "chicken"][i % 3] }));
}
export function swapDemoLunch(days: DemoDay[], index: number): DemoDay[] {
  if (!Number.isInteger(index) || index < 0 || index >= days.length) throw new Error("Invalid day.");
  return days.map((d, i) => i === index ? { ...d, lunch: d.lunch === "beans" ? "chicken" : "beans" } : { ...d });
}
export function consolidateDemo(days: DemoDay[]) {
  const totals = new Map<string, { quantity: number; meals: Set<string> }>();
  for (const day of days) for (const recipeId of [day.breakfast, day.lunch, day.dinner]) {
    const recipe = recipes[recipeId];
    if (!recipe) throw new Error("Unknown demo recipe.");
    for (const [id, quantity] of recipe.items) {
      if (!catalog[id] || !Number.isFinite(quantity) || quantity <= 0) throw new Error("Invalid demo ingredient.");
      const previous = totals.get(id) ?? { quantity: 0, meals: new Set<string>() };
      previous.quantity += quantity; previous.meals.add(recipe.name); totals.set(id, previous);
    }
  }
  return [...totals].map(([id, value]) => {
    const item = catalog[id]; const packs = Math.ceil(value.quantity / item.packSize);
    return { id, ...item, quantity: value.quantity, packs, costCents: packs * item.priceCents, leftover: packs * item.packSize - value.quantity, meals: [...value.meals] };
  }).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}
export function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
