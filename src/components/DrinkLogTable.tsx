
'use client';

import type { DrinkEntry } from '@/types';
import { DRINK_TYPES } from '@/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LucideIcon } from 'lucide-react';

interface DrinkLogTableProps {
  drinks: DrinkEntry[] | undefined;
}

export function DrinkLogTable({ drinks }: DrinkLogTableProps) {
  if (!drinks || drinks.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No drinks logged for this day yet.</p>;
  }

  // Sort drinks by timestamp in descending order (most recent first)
  const sortedDrinks = [...drinks].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="max-h-96 overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
          <TableRow>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead>Drink Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDrinks.map((drink, index) => {
            const drinkInfo = DRINK_TYPES.find(dt => dt.name === drink.type);
            const IconComponent = drinkInfo?.icon as LucideIcon | undefined;
            return (
              <TableRow key={`${drink.timestamp}-${index}`}>
                <TableCell className="font-medium">
                  {format(new Date(drink.timestamp), 'p')} 
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {IconComponent && <IconComponent className="mr-2 h-4 w-4 text-foreground/80" />}
                    {drinkInfo?.displayName || drink.type}
                  </div>
                </TableCell>
                <TableCell className="text-right">{drink.amount.toLocaleString()} ml</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
