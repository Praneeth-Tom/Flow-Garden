
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
import { Droplet } from 'lucide-react';

interface WaterIntakeInputProps {
  onAddWater: (amount: number, drinkType: string) => void;
  disabled?: boolean;
}

const QUICK_ADD_AMOUNTS = [250, 500, 750]; // in ml

export function WaterIntakeInput({ onAddWater, disabled = false }: WaterIntakeInputProps) {
  const [amount, setAmount] = useState('');
  const [selectedDrinkType, setSelectedDrinkType] = useState<string>(DRINK_TYPES[0].name); // Default to Water
  const { toast } = useToast();

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
    setAmount('');
    const drinkDisplayName = DRINK_TYPES.find(dt => dt.name === selectedDrinkType)?.displayName || selectedDrinkType;
    toast({
      title: 'Intake Added!',
      description: `${numAmount}ml of ${drinkDisplayName} added.`,
    });
  };

  const handleQuickAdd = (quickAmount: number) => {
    // Quick add defaults to Water
    const waterType = DRINK_TYPES.find(dt => dt.name === 'Water')?.name || DRINK_TYPES[0].name;
    onAddWater(quickAmount, waterType);
    const drinkDisplayName = DRINK_TYPES.find(dt => dt.name === waterType)?.displayName || waterType;
    toast({
      title: 'Intake Added!',
      description: `${quickAmount}ml of ${drinkDisplayName} added.`,
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-grow">
          <label htmlFor="drink-type" className="block text-sm font-medium text-muted-foreground mb-1">Drink Type</label>
          <Select value={selectedDrinkType} onValueChange={setSelectedDrinkType} disabled={disabled}>
            <SelectTrigger id="drink-type" className="w-full">
              <SelectValue placeholder="Select drink type" />
            </SelectTrigger>
            <SelectContent>
              {DRINK_TYPES.map(drink => (
                <SelectItem key={drink.name} value={drink.name}>
                  {drink.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow">
          <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-1">Amount (ml)</label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 250"
            aria-label="Water amount in milliliters"
            className="w-full"
            disabled={disabled}
          />
        </div>
        <Button type="submit" disabled={disabled || !amount} className="h-10">
          <Droplet className="mr-2 h-4 w-4" /> Add
        </Button>
      </form>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        <span className="text-sm text-muted-foreground self-center mr-2">Quick Add (Water):</span>
        {QUICK_ADD_AMOUNTS.map(qAmount => (
          <Button 
            key={qAmount} 
            variant="outline" 
            onClick={() => handleQuickAdd(qAmount)}
            disabled={disabled}
            aria-label={`Quick add ${qAmount} ml of Water`}
          >
            + {qAmount} ml
          </Button>
        ))}
      </div>
    </div>
  );
}
