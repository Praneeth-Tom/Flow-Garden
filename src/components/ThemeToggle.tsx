
'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react'; // Added Laptop for System
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button'; // Button not strictly needed if only used as menu items
import {
  DropdownMenuItem,
  // DropdownMenu, // No longer a self-contained DropdownMenu
  // DropdownMenuContent,
  // DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// This component will now render the items for the theme selection part of a larger dropdown
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent' : ''}>
        <Sun className="mr-2 h-4 w-4" />
        Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent' : ''}>
        <Moon className="mr-2 h-4 w-4" />
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent' : ''}>
        <Laptop className="mr-2 h-4 w-4" />
        System
      </DropdownMenuItem>
    </>
  );
}
