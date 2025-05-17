
export interface DrinkEntry {
  type: string; // e.g., 'Water', 'Juice'
  amount: number; // in milliliters
}

export interface WaterIntakeRecord {
  date: string; // YYYY-MM-DD
  drinks: DrinkEntry[];
  goal: number; // daily goal in milliliters
}

export interface DrinkTypeInfo {
  name: string;
  colorVariable: string; // CSS variable name for HSL color
  displayName: string;
}

export const DRINK_TYPES: DrinkTypeInfo[] = [
  { name: 'Water', displayName: '💧 Water', colorVariable: '--drink-water' },
  { name: 'Juice', displayName: '🍹 Juice', colorVariable: '--drink-juice' },
  { name: 'Coffee', displayName: '☕ Coffee', colorVariable: '--drink-coffee' },
  { name: 'Tea', displayName: '🫖 Tea', colorVariable: '--drink-tea' },
  { name: 'Milk', displayName: '🥛 Milk', colorVariable: '--drink-milk' },
  { name: 'Alcohol', displayName: '🍺 Alcohol', colorVariable: '--drink-alcohol' },
  // Add more drink types here if needed
];

export function getDrinkColor(drinkType: string): string {
  const drinkInfo = DRINK_TYPES.find(dt => dt.name === drinkType);
  return drinkInfo ? `hsl(var(${drinkInfo.colorVariable}))` : 'hsl(var(--muted))';
}

export function getTotalIntake(drinks: DrinkEntry[] | undefined): number {
  if (!drinks) return 0;
  return drinks.reduce((sum, drink) => sum + drink.amount, 0);
}
