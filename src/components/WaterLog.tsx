
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { getWaterIntakeData, saveWaterIntakeData } from '@/lib/storage';
import type { WaterIntakeRecord, DrinkEntry } from '@/types';
// getTotalIntake is fine, no longer need DRINK_TYPES here directly
import { CalendarView } from './CalendarView';
import { DailyIntakeDisplay } from './DailyIntakeDisplay';
import { WaterIntakeInput } from './WaterIntakeInput';
import { DrinkLogTable } from './DrinkLogTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Removed Label, Switch, useToast, BellRing, SlidersHorizontal as they are moved or not used
import { CalendarDays, Droplet, PlusCircle, BarChart3 } from 'lucide-react';


const DEFAULT_DAILY_GOAL_ML = 2000;

export function WaterLog() {
  const [records, setRecords] = useState<WaterIntakeRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [isClient, setIsClient] = useState(false);
  // Reminder state and notification permission state are now managed in HomePage

  useEffect(() => {
    setIsClient(true);
    const storedData = getWaterIntakeData();
    const migratedData = storedData.map(record => {
      let drinks = record.drinks || [];
      // @ts-ignore: Check for old 'amount' property
      if (record.hasOwnProperty('amount') && !record.drinks) { 
        // @ts-ignore
        const oldAmount = record.amount as number;
        // @ts-ignore
        drinks = oldAmount > 0 ? [{ type: 'Water', amount: oldAmount, timestamp: new Date(record.date).getTime() }] : [];
      }
      const updatedDrinks = drinks.map(drink => ({
        ...drink,
        timestamp: drink.timestamp || new Date(record.date).getTime() 
      }));
      return {
        ...record,
        drinks: updatedDrinks,
        goal: record.goal || DEFAULT_DAILY_GOAL_ML,
      };
    });
    setRecords(migratedData as WaterIntakeRecord[]);
    // Notification permission and reminder preference loading moved to HomePage
  }, []);

  useEffect(() => {
    if (isClient) {
      saveWaterIntakeData(records);
    }
  }, [records, isClient]);
  
  // Reminder and notification permission effect moved to HomePage

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
    }
  }, []);

  const handleAddWater = useCallback((amount: number, drinkType: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newDrinkEntry: DrinkEntry = {
      type: drinkType,
      amount: amount,
      timestamp: Date.now(),
    };

    setRecords(prevRecords => {
      const existingRecordIndex = prevRecords.findIndex(r => r.date === dateStr);
      let newRecords = [...prevRecords];

      if (existingRecordIndex > -1) {
        const updatedRecord = { ...newRecords[existingRecordIndex] };
        updatedRecord.drinks = [...(updatedRecord.drinks || []), newDrinkEntry];
        newRecords[existingRecordIndex] = updatedRecord;
      } else {
        newRecords.push({
          date: dateStr,
          drinks: [newDrinkEntry],
          goal: DEFAULT_DAILY_GOAL_ML,
        });
      }
      return newRecords;
    });
  }, [selectedDate]);

  const currentDayRecord = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return records.find(r => r.date === dateStr);
  }, [records, selectedDate]);
  
  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <Card className="md:col-span-1 bg-muted/50">
          <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div></CardHeader>
          <CardContent><div className="h-64 bg-muted rounded"></div></CardContent>
        </Card>
        <div className="md:col-span-2 space-y-6">
          {[1,2,3].map(i => (
             <Card key={i} className="bg-muted/50">
              <CardHeader><div className="h-6 bg-muted rounded w-1/2"></div></CardHeader>
              <CardContent><div className={`h-${20 + i*2} bg-muted rounded`}></div></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
      {/* Left Column: Calendar */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
            <CardDescription>Select a date to view or log intake.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CalendarView
              records={records}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              dailyGoal={DEFAULT_DAILY_GOAL_ML}
            />
          </CardContent>
        </Card>

        {/* Settings Card Removed - Functionality moved to header dropdown */}
      </div>

      {/* Right Column: Intake Display, Logging, and Log Table */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Droplet className="mr-2 h-5 w-5 text-primary" />
              Intake for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyIntakeDisplay record={currentDayRecord} goal={DEFAULT_DAILY_GOAL_ML} />
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <PlusCircle className="mr-2 h-5 w-5 text-primary" />
              Log Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WaterIntakeInput onAddWater={handleAddWater} />
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Daily Log
            </CardTitle>
            <CardDescription>Detailed breakdown of drinks consumed today.</CardDescription>
          </CardHeader>
          <CardContent>
            <DrinkLogTable drinks={currentDayRecord?.drinks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
