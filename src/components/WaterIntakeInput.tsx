
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { DRINK_TYPES } from '@/types';
import type { LucideIcon } from 'lucide-react'; // For select items
import { Droplet } from 'lucide-react'; // Default icon for fallback
import { DrinkVisualizer } from './DrinkVisualizer';

interface WaterIntakeInputProps {
  onAddWater: (amount: number, drinkType: string) => void;
  disabled?: boolean;
}

const QUICK_ADD_AMOUNTS = [250, 500, 750]; // in ml

export function WaterIntakeInput({ onAddWater, disabled = false }: WaterIntakeInputProps) {
  const [amount, setAmount] = useState('');
  const [selectedDrinkType, setSelectedDrinkType] = useState<string>(DRINK_TYPES[0].name); // Default to Water
  const { toast } = useToast();

  const selectedDrinkInfo = DRINK_TYPES.find(dt => dt.name === selectedDrinkType);
  // Icon for the "Add" button, not the visualizer
  const AddButtonIcon = selectedDrinkInfo?.icon || Droplet; 

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a positive number for water amount.',
        variant: 'destructive',
      });
      return;
    }
    onAddWater(numAmount, selectedDrinkType);
    setAmount(''); // Reset amount after adding
    const drinkDisplayName = DRINK_TYPES.find(dt => dt.name === selectedDrinkType)?.displayName || selectedDrinkType;
    toast({
      title: 'Intake Added!',
      description: `${numAmount}ml of ${drinkDisplayName} added.`,
    });
  };

  const handleQuickAdd = (quickAmount: number) => {
    const waterTypeInfo = DRINK_TYPES.find(dt => dt.name === 'Water') || DRINK_TYPES[0];
    onAddWater(quickAmount, waterTypeInfo.name); // Quick add always adds 'Water'
    toast({
      title: 'Intake Added!',
      description: `${quickAmount}ml of ${waterTypeInfo.displayName} added.`,
    });
  }

  const currentNumAmount = parseInt(amount, 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-1">
        <DrinkVisualizer
          drinkType={selectedDrinkType}
          currentAmount={isNaN(currentNumAmount) || currentNumAmount < 0 ? 0 : currentNumAmount}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-2 md:space-y-0">
        <div className="flex-grow">
          <label htmlFor="drink-type" className="block text-sm font-medium text-muted-foreground mb-1">Drink Type</label>
          <Select value={selectedDrinkType} onValueChange={setSelectedDrinkType} disabled={disabled}>
            <SelectTrigger id="drink-type" className="w-full">
              <SelectValue placeholder="Select drink type" />
            </SelectTrigger>
            <SelectContent>
              {DRINK_TYPES.map(drink => {
                const ItemIcon = drink.icon as LucideIcon; // Cast as LucideIcon for SelectItem
                return (
                  <SelectItem key={drink.name} value={drink.name}>
                    <div className="flex items-center">
                      <ItemIcon className="mr-2 h-5 w-5 text-foreground/80" />
                      <span>{drink.displayName}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-grow">
          <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-1">
            Amount (ml)
          </label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 250"
            aria-label="Water amount in milliliters"
            className="w-full"
            disabled={disabled}
            min="1"
          />
        </div>
        <Button type="submit" disabled={disabled || !amount || parseInt(amount,10) <=0} className="h-10 w-full md:w-auto">
          <AddButtonIcon className="mr-2 h-4 w-4" /> Add
        </Button>
      </form>
      
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        <span className="text-sm text-muted-foreground self-center mr-2">Quick Add (Water):</span>
        {QUICK_ADD_AMOUNTS.map(qAmount => {
          const WaterIcon = DRINK_TYPES.find(dt => dt.name === 'Water')?.icon || Droplet;
          return (
            <Button 
              key={qAmount} 
              variant="outline" 
              onClick={() => handleQuickAdd(qAmount)}
              disabled={disabled}
              aria-label={`Quick add ${qAmount} ml of Water`}
              className="h-10"
            >
              <WaterIcon className="mr-2 h-4 w-4" /> + {qAmount} ml
            </Button>
          );
        })}
      </div>
    </div>
  );
}
