
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { getWaterIntakeData, saveWaterIntakeData } from '@/lib/storage';
import type { WaterIntakeRecord, DrinkEntry, UserProfile } from '@/types';
import { CalendarView } from './CalendarView';
import { DailyIntakeDisplay } from './DailyIntakeDisplay';
import { WaterIntakeInput } from './WaterIntakeInput';
import { DrinkLogTable } from './DrinkLogTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Droplet, PlusCircle, BarChart3, Trash2 } from 'lucide-react';
import { FALLBACK_GOAL_ML, calculateDailyGoal } from '@/lib/goalCalculator'; // Import calculateDailyGoal
import { Button, buttonVariants } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


interface WaterLogProps {
  userProfile: UserProfile | null;
  calculatedDailyGoal: number;
}

export function WaterLog({ userProfile, calculatedDailyGoal }: WaterLogProps) {
  const [records, setRecords] = useState<WaterIntakeRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

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
      
      const goalForRecord = record.goal || calculateDailyGoal(userProfile) || FALLBACK_GOAL_ML;

      return {
        ...record,
        drinks: updatedDrinks,
        goal: goalForRecord,
      };
    });
    setRecords(migratedData as WaterIntakeRecord[]);
  }, [userProfile]); 

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
        updatedRecord.goal = updatedRecord.goal || calculatedDailyGoal;
        newRecords[existingRecordIndex] = updatedRecord;
      } else {
        newRecords.push({
          date: dateStr,
          drinks: [newDrinkEntry],
          goal: calculatedDailyGoal, 
        });
      }
      return newRecords;
    });
  }, [selectedDate, calculatedDailyGoal]);

  const currentDayRecord = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return records.find(r => r.date === dateStr);
  }, [records, selectedDate]);
  
  const displayGoal = currentDayRecord?.goal || calculatedDailyGoal;

  const handleClearDayLog = useCallback(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setRecords(prevRecords => {
      return prevRecords.map(record => {
        if (record.date === dateStr) {
          return { ...record, drinks: [] }; // Clear drinks for the selected date
        }
        return record;
      }).filter(record => record.drinks.length > 0 || record.date !== dateStr); // Optionally keep records for other days even if empty, or remove if empty and not today
                                                                               // Current logic: keeps the record with empty drinks to preserve its goal for that day.
                                                                               // To remove empty records:
                                                                               // .filter(record => record.drinks.length > 0 || record.date !== dateStr)
                                                                               // For simplicity, and to retain historical goals, we just clear the drinks array.
    });
    toast({
      title: "Log Cleared",
      description: `All entries for ${format(selectedDate, 'MMMM d, yyyy')} have been cleared.`,
    });
  }, [selectedDate, toast]);


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
              dailyGoal={calculatedDailyGoal} 
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <Card className="shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Droplet className="mr-2 h-5 w-5 text-primary" />
              Intake for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyIntakeDisplay record={currentDayRecord} goal={displayGoal} />
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Daily Log
              </CardTitle>
              {currentDayRecord && currentDayRecord.drinks && currentDayRecord.drinks.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive/90 border-destructive/50 hover:border-destructive"
                      aria-label={`Clear log for ${format(selectedDate, 'MMMM d, yyyy')}`}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear Log
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete all drink entries for {format(selectedDate, 'MMMM d, yyyy')}. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearDayLog}
                        className={buttonVariants({ variant: "destructive" })}
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <CardDescription>Detailed breakdown of drinks consumed on selected day.</CardDescription>
          </CardHeader>
          <CardContent>
            <DrinkLogTable drinks={currentDayRecord?.drinks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

