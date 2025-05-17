
import type { LucideIcon } from 'lucide-react';
import { Droplet, Grape, Coffee, Leaf, Milk, Wine, UserCircle2, SlidersHorizontal, BarChart3 } from 'lucide-react';

export interface DrinkEntry {
  type: string; // e.g., 'Water', 'Juice'
  amount: number; // in milliliters
  timestamp: number; // Unix timestamp (ms)
}

export interface WaterIntakeRecord {
  date: string; // YYYY-MM-DD
  drinks: DrinkEntry[];
  goal: number; // daily goal in milliliters for that specific day
}

export interface DrinkTypeInfo {
  name: string;
  displayName: string;
  colorVariable: string; // CSS variable name for HSL color
  icon: LucideIcon;
  visuals: [string, string]; // Identifiers for two swappable visual components
}

export const DRINK_TYPES: DrinkTypeInfo[] = [
  { name: 'Water', displayName: '💧 Water', colorVariable: '--drink-water', icon: Droplet, visuals: ['glass', 'jug'] },
  { name: 'Juice', displayName: '🍹 Juice', colorVariable: '--drink-juice', icon: Grape, visuals: ['glass', 'juice-bottle'] },
  { name: 'Coffee', displayName: '☕ Coffee', colorVariable: '--drink-coffee', icon: Coffee, visuals: ['small-cup', 'coffee-mug'] },
  { name: 'Tea', displayName: '🫖 Tea', colorVariable: '--drink-tea', icon: Leaf, visuals: ['small-cup', 'kettle'] },
  { name: 'Milk', displayName: '🥛 Milk', colorVariable: '--drink-milk', icon: Milk, visuals: ['glass', 'milk-carton'] },
  { name: 'Alcohol', displayName: '🍺 Alcohol', colorVariable: '--drink-alcohol', icon: Wine, visuals: ['beer-mug', 'cocktail-glass'] },
];

export function getDrinkColor(drinkType: string): string {
  const drinkInfo = DRINK_TYPES.find(dt => dt.name === drinkType);
  return drinkInfo ? `hsl(var(${drinkInfo.colorVariable}))` : 'hsl(var(--muted))';
}

export function getTotalIntake(drinks: DrinkEntry[] | undefined): number {
  if (!drinks) return 0;
  return drinks.reduce((sum, drink) => sum + drink.amount, 0);
}

export interface UserProfile {
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  exerciseMinutes?: number; // minutes per day
}

// Header icon types for clarity, though not strictly necessary for functionality
export { UserCircle2 as ProfileIcon, SlidersHorizontal as SettingsIcon, BarChart3 as DailyLogIcon };
