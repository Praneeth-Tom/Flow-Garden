
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { getWaterIntakeData, saveWaterIntakeData } from '@/lib/storage';
import type { WaterIntakeRecord, DrinkEntry } from '@/types';
import { getTotalIntake } from '@/types'; // getTotalIntake is fine
import { CalendarView } from './CalendarView';
import { DailyIntakeDisplay } from './DailyIntakeDisplay';
import { WaterIntakeInput } from './WaterIntakeInput';
import { DrinkLogTable } from './DrinkLogTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Droplet, PlusCircle, BellRing, SlidersHorizontal, BarChart3 } from 'lucide-react';

const DEFAULT_DAILY_GOAL_ML = 2000;

export function WaterLog() {
  const [records, setRecords] = useState<WaterIntakeRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [isClient, setIsClient] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedData = getWaterIntakeData();
    // Migration for old data: ensure drinks array and timestamp exists
    const migratedData = storedData.map(record => {
      let drinks = record.drinks || [];
      // @ts-ignore: Check for old 'amount' property
      if (record.hasOwnProperty('amount') && !record.drinks) { 
        // @ts-ignore
        const oldAmount = record.amount as number;
        // @ts-ignore
        drinks = oldAmount > 0 ? [{ type: 'Water', amount: oldAmount, timestamp: new Date(record.date).getTime() }] : [];
      }
      // Ensure all drink entries have a timestamp
      const updatedDrinks = drinks.map(drink => ({
        ...drink,
        timestamp: drink.timestamp || new Date(record.date).getTime() // Fallback timestamp if missing
      }));
      return {
        ...record,
        drinks: updatedDrinks,
        goal: record.goal || DEFAULT_DAILY_GOAL_ML,
      };
    });
    setRecords(migratedData as WaterIntakeRecord[]);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
     // Load reminder preference from localStorage if available
    const storedReminderPref = localStorage.getItem('dailyDrops_remindersEnabled');
    if (storedReminderPref) {
      const isEnabled = JSON.parse(storedReminderPref);
      setRemindersEnabled(isEnabled);
      if (isEnabled && Notification.permission === 'default') {
        // If reminders were enabled but permission is default, re-request.
        // This handles cases where user reloads before granting/denying.
        requestNotificationPerm();
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      saveWaterIntakeData(records);
    }
  }, [records, isClient]);
  
  const requestNotificationPerm = async () => {
    if (!('Notification' in window)) {
      toast({ title: "Notifications not supported", description: "Your browser does not support desktop notifications.", variant: "destructive" });
      setRemindersEnabled(false); // Disable if not supported
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      toast({ title: "Notifications Enabled", description: "You'll receive reminders to stay hydrated." });
      return;
    }
    if (Notification.permission === 'denied') {
      setNotificationPermission('denied');
      toast({ title: "Notifications Denied", description: "Please enable notifications in your browser settings to receive reminders.", variant: "destructive" });
      setRemindersEnabled(false); // Turn off toggle if denied
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      toast({ title: "Notifications Enabled", description: "You'll receive reminders to stay hydrated." });
    } else if (permission === 'denied') {
      toast({ title: "Notifications Denied", description: "Please enable notifications in your browser settings to receive reminders.", variant: "destructive" });
      setRemindersEnabled(false); // Ensure toggle is off
    } else {
      // User dismissed, do nothing specific, toggle remains as is or user might try again
      toast({ title: "Notification Permission Pending", description: "You can enable reminders again if you change your mind." });
    }
  };

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('dailyDrops_remindersEnabled', JSON.stringify(remindersEnabled));
      if (remindersEnabled && notificationPermission === 'default') {
        requestNotificationPerm();
      } else if (remindersEnabled && notificationPermission === 'granted') {
        // Placeholder for actual reminder scheduling logic
        console.log("Reminder scheduling would start here.");
      } else if (!remindersEnabled) {
        // Placeholder for clearing reminder scheduling logic
        console.log("Reminder scheduling would be cleared here.");
      }
    }
  }, [remindersEnabled, notificationPermission, isClient]);


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
        updatedRecord.drinks = [...(updatedRecord.drinks || []), newDrinkEntry]; // Always add as new entry
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
      {/* Left Column: Calendar and Settings */}
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

        <Card className="shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-2 rounded-md border">
              <Label htmlFor="reminders-switch" className="flex items-center cursor-pointer">
                <BellRing className="mr-2 h-4 w-4" />
                Enable Drink Reminders
              </Label>
              <Switch
                id="reminders-switch"
                checked={remindersEnabled}
                onCheckedChange={(checked) => {
                  setRemindersEnabled(checked);
                  if (checked && Notification.permission === 'default') {
                    requestNotificationPerm();
                  } else if (checked && Notification.permission === 'denied') {
                     toast({ title: "Notifications Denied", description: "Enable notifications in browser settings to use reminders.", variant: "destructive" });
                     setRemindersEnabled(false); // Keep it off if denied
                  }
                }}
                aria-label="Toggle drink reminders"
              />
            </div>
            {notificationPermission === 'denied' && remindersEnabled && (
                <p className="text-xs text-destructive">Notifications are blocked. Please update your browser settings.</p>
            )}
          </CardContent>
        </Card>
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
