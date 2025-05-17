
'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// This component will now render a row of icon buttons for theme selection
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const themes = [
    { name: 'light', icon: Sun, label: 'Light Theme' },
    { name: 'dark', icon: Moon, label: 'Dark Theme' },
    { name: 'system', icon: Laptop, label: 'System Theme' },
  ];

  return (
    <div className="flex items-center justify-around p-1 space-x-1">
      {themes.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8", // Adjusted size for a more compact look
            theme === item.name && "bg-accent text-accent-foreground"
          )}
          onClick={() => setTheme(item.name)}
          aria-label={item.label}
        >
          <item.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
