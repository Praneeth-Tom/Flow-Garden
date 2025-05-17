import type { WaterIntakeRecord } from '@/types';

const STORAGE_KEY = 'dailyDrops_waterIntakeData';

export function getWaterIntakeData(): WaterIntakeRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function saveWaterIntakeData(data: WaterIntakeRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}
