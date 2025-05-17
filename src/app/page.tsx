
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { WaterLog } from '@/components/WaterLog';
import { Droplet, SlidersHorizontal, BarChart3, BellRing, UserCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';
import { getUserProfile, saveUserProfile } from '@/lib/storage';
import { calculateDailyGoal, FALLBACK_GOAL_ML } from '@/lib/goalCalculator';

const profileFormSchema = z.object({
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  age: z.coerce.number().min(0).max(150).optional().or(z.literal('')),
  height: z.coerce.number().min(0).max(300).optional().or(z.literal('')), // cm
  weight: z.coerce.number().min(0).max(500).optional().or(z.literal('')), // kg
  exerciseMinutes: z.coerce.number().min(0).max(1440).optional().or(z.literal('')), // minutes per day
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [calculatedDailyGoal, setCalculatedDailyGoal] = useState<number>(FALLBACK_GOAL_ML);
  
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      gender: '',
      age: '',
      height: '',
      weight: '',
      exerciseMinutes: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    const storedReminderPref = localStorage.getItem('dailyDrops_remindersEnabled');
    if (storedReminderPref) {
      const isEnabled = JSON.parse(storedReminderPref);
      setRemindersEnabled(isEnabled);
    }

    const loadedProfile = getUserProfile();
    if (loadedProfile) {
      setUserProfile(loadedProfile);
      profileForm.reset({
        gender: loadedProfile.gender || '',
        age: loadedProfile.age || '',
        height: loadedProfile.height || '',
        weight: loadedProfile.weight || '',
        exerciseMinutes: loadedProfile.exerciseMinutes || '',
      });
      setCalculatedDailyGoal(calculateDailyGoal(loadedProfile));
    } else {
      setCalculatedDailyGoal(calculateDailyGoal(null)); // Use fallback if no profile
    }
  }, [profileForm]);

  const handleProfileSubmit = (values: ProfileFormValues) => {
    const updatedProfile: UserProfile = {
      gender: values.gender || undefined,
      age: values.age ? Number(values.age) : undefined,
      height: values.height ? Number(values.height) : undefined,
      weight: values.weight ? Number(values.weight) : undefined,
      exerciseMinutes: values.exerciseMinutes ? Number(values.exerciseMinutes) : undefined,
    };
    saveUserProfile(updatedProfile);
    setUserProfile(updatedProfile);
    setCalculatedDailyGoal(calculateDailyGoal(updatedProfile));
    toast({ title: "Profile Updated", description: "Your daily goal has been recalculated." });
    // Note: Age and Gender are collected but not used in the current goal calculation formula.
  };

  const requestNotificationPerm = async () => {
    // ... (notification permission logic remains the same)
    if (!('Notification' in window)) {
      toast({ title: "Notifications not supported", description: "Your browser does not support desktop notifications.", variant: "destructive" });
      setRemindersEnabled(false);
      return false;
    }
    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }
    if (Notification.permission === 'denied') {
      setNotificationPermission('denied');
      toast({ title: "Notifications Denied", description: "Please enable notifications in your browser settings to receive reminders.", variant: "destructive" });
      setRemindersEnabled(false);
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      toast({ title: "Notifications Enabled", description: "You'll receive reminders to stay hydrated." });
      return true;
    } else if (permission === 'denied') {
      toast({ title: "Notifications Denied", description: "Please enable notifications in your browser settings to receive reminders.", variant: "destructive" });
      setRemindersEnabled(false);
      return false;
    } else {
      toast({ title: "Notification Permission Pending", description: "You can enable reminders again if you change your mind." });
      return false;
    }
  };

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('dailyDrops_remindersEnabled', JSON.stringify(remindersEnabled));
      if (remindersEnabled && notificationPermission === 'granted') {
        console.log("Reminder scheduling would start here if permission granted.");
      } else if (!remindersEnabled) {
        console.log("Reminder scheduling would be cleared here.");
      }
    }
  }, [remindersEnabled, notificationPermission, isClient]);

  const handleReminderChange = async (checked: boolean) => {
    if (checked) {
      const permissionGranted = await requestNotificationPerm();
      if (permissionGranted) {
        setRemindersEnabled(true);
      } else {
        setRemindersEnabled(false);
      }
    } else {
      setRemindersEnabled(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 text-foreground flex flex-col">
      <header className="bg-card/85 dark:bg-card/75 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Droplet className="h-8 w-8 text-primary" data-ai-hint="water drop" />
            <h1 className="text-3xl font-semibold tracking-tight">Daily Drops</h1>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Daily Log Options" className="text-foreground/70 hover:text-foreground">
                  <BarChart3 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled>View Stats (coming soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Export Log (coming soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Application Settings" className="text-foreground/70 hover:text-foreground">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <ThemeToggle />
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
                  <div className="flex items-center justify-between w-full">
                    <Label htmlFor="reminders-switch-header" className="flex items-center cursor-pointer text-sm">
                      <BellRing className="mr-2 h-4 w-4" />
                      Drink Reminders
                    </Label>
                    <Switch
                      id="reminders-switch-header"
                      checked={remindersEnabled}
                      onCheckedChange={handleReminderChange}
                      aria-label="Toggle drink reminders"
                    />
                  </div>
                </DropdownMenuItem>
                {notificationPermission === 'denied' && remindersEnabled && isClient && (
                  <DropdownMenuItem disabled className="text-xs !text-destructive px-2 pt-0 pb-1 h-auto">
                    Notifications blocked in browser.
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User Profile" className="text-foreground/70 hover:text-foreground">
                  <UserCircle2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-4">
                <DropdownMenuLabel className="text-lg font-semibold mb-2 text-center">User Profile</DropdownMenuLabel>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Years)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={profileForm.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 70" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 175" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="exerciseMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Exercise (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Save Profile</Button>
                  </form>
                </Form>
                 <p className="text-xs text-muted-foreground mt-3 text-center">
                    Age & Gender are collected for future enhancements and do not affect the current daily goal calculation.
                 </p>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <WaterLog 
            userProfile={userProfile} 
            calculatedDailyGoal={calculatedDailyGoal}
          />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border bg-card/85 dark:bg-card/75 backdrop-blur-md">
        <p>&copy; {new Date().getFullYear()} Daily Drops. Stay Hydrated!</p>
      </footer>
    </div>
  );
}
