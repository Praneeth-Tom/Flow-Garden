'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { getWaterIntakeData, saveWaterIntakeData } from '@/lib/storage';
import type { WaterIntakeRecord } from '@/types';
import { CalendarView } from './CalendarView';
import { DailyIntakeDisplay } from './DailyIntakeDisplay';
import { WaterIntakeInput } from './WaterIntakeInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Droplet, PlusCircle } from 'lucide-react';

const DEFAULT_DAILY_GOAL_ML = 2000;

export function WaterLog() {
  const [records, setRecords] = useState<WaterIntakeRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setRecords(getWaterIntakeData());
  }, []);

  useEffect(() => {
    if (isClient) {
      saveWaterIntakeData(records);
    }
  }, [records, isClient]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
    }
  }, []);

  const handleAddWater = useCallback((amount: number) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setRecords(prevRecords => {
      const existingRecordIndex = prevRecords.findIndex(r => r.date === dateStr);
      let newRecords = [...prevRecords];
      if (existingRecordIndex > -1) {
        const updatedRecord = {
          ...newRecords[existingRecordIndex],
          amount: newRecords[existingRecordIndex].amount + amount,
        };
        newRecords[existingRecordIndex] = updatedRecord;
      } else {
        newRecords.push({
          date: dateStr,
          amount: amount,
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
    // Render a loading state or placeholder to avoid hydration mismatch
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <Card className="md:col-span-1 bg-muted/50">
          <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div></CardHeader>
          <CardContent><div className="h-64 bg-muted rounded"></div></CardContent>
        </Card>
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-muted/50">
            <CardHeader><div className="h-6 bg-muted rounded w-1/2"></div></CardHeader>
            <CardContent><div className="h-20 bg-muted rounded"></div></CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardHeader><div className="h-6 bg-muted rounded w-1/3"></div></CardHeader>
            <CardContent><div className="h-24 bg-muted rounded"></div></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md">
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

      <div className="lg:col-span-2 space-y-6">
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
              Log Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WaterIntakeInput onAddWater={handleAddWater} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
