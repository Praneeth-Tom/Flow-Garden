
import type { UserProfile } from '@/types';

const BASE_ML_PER_KG = 30; // Using the lower end of the 30-40ml range as per example.
const ML_PER_30_MIN_EXERCISE = 365;
export const FALLBACK_GOAL_ML = 2000; // Default goal if profile is not set or incomplete.

/**
 * Calculates the daily water intake goal based on user profile.
 * Formula: (Weight kg × 30) + (Exercise Minutes / 30 × 365)
 * Age and gender are not used in this specific formula.
 * @param profile - The user's profile data.
 * @returns The calculated daily goal in ml, or a fallback goal.
 */
export function calculateDailyGoal(profile?: UserProfile | null): number {
  if (
    !profile ||
    typeof profile.weight !== 'number' ||
    typeof profile.exerciseMinutes !== 'number'
  ) {
    return FALLBACK_GOAL_ML;
  }

  const weight = profile.weight;
  const exerciseMinutes = profile.exerciseMinutes;

  if (weight <= 0) {
    // Handle invalid weight, could also return FALLBACK_GOAL_ML or throw an error
    return FALLBACK_GOAL_ML;
  }

  const baselineIntake = weight * BASE_ML_PER_KG;
  const exerciseAdjustment = (exerciseMinutes / 30) * ML_PER_30_MIN_EXERCISE;

  const totalIntake = baselineIntake + exerciseAdjustment;
  
  // Ensure the goal is a positive number, otherwise fallback.
  if (totalIntake <=0) return FALLBACK_GOAL_ML;

  return Math.round(totalIntake); // Round to the nearest milliliter
}
