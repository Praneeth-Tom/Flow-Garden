import type { WaterIntakeRecord, UserProfile } from '@/types';

const WATER_INTAKE_STORAGE_KEY = 'flowGarden_waterIntakeData'; // Updated key
const USER_PROFILE_STORAGE_KEY = 'flowGarden_userProfile'; // Updated key

export function getWaterIntakeData(): WaterIntakeRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const data = window.localStorage.getItem(WATER_INTAKE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading water intake data from localStorage:', error);
    return [];
  }
}

export function saveWaterIntakeData(data: WaterIntakeRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(WATER_INTAKE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing water intake data to localStorage:', error);
  }
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const data = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user profile from localStorage:', error);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error writing user profile to localStorage:', error);
  }
}
