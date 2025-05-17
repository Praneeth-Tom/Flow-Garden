
'use client';

import { useState, useEffect } from 'react';
import { WaterLog } from '@/components/WaterLog';
import { Droplet, SlidersHorizontal, BarChart3, BellRing } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    const storedReminderPref = localStorage.getItem('dailyDrops_remindersEnabled');
    if (storedReminderPref) {
      const isEnabled = JSON.parse(storedReminderPref);
      setRemindersEnabled(isEnabled);
      // No automatic re-request on load here, user must interact with switch if permission is default.
    }
  }, []);

  const requestNotificationPerm = async () => {
    if (!('Notification' in window)) {
      toast({ title: "Notifications not supported", description: "Your browser does not support desktop notifications.", variant: "destructive" });
      setRemindersEnabled(false);
      return false;
    }
    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      // toast({ title: "Notifications Already Enabled", description: "You can receive reminders." }); // Optional: notify if already granted
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
        // Placeholder for actual reminder scheduling logic
        console.log("Reminder scheduling would start here if permission granted.");
      } else if (!remindersEnabled) {
        // Placeholder for clearing reminder scheduling logic
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
        // If permission wasn't granted (denied or default/dismissed), ensure toggle is off
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
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <ThemeToggle /> 
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <WaterLog />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border bg-card/85 dark:bg-card/75 backdrop-blur-md">
        <p>&copy; {new Date().getFullYear()} Daily Drops. Stay Hydrated!</p>
      </footer>
    </div>
  );
}

