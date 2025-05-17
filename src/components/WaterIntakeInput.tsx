'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Droplet } from 'lucide-react';

interface WaterIntakeInputProps {
  onAddWater: (amount: number) => void;
  disabled?: boolean;
}

const QUICK_ADD_AMOUNTS = [250, 500, 750]; // in ml

export function WaterIntakeInput({ onAddWater, disabled = false }: WaterIntakeInputProps) {
  const [amount, setAmount] = useState('');
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
    onAddWater(numAmount);
    setAmount('');
    toast({
      title: 'Water Added!',
      description: `${numAmount}ml added to your daily intake.`,
    });
  };

  const handleQuickAdd = (quickAmount: number) => {
    onAddWater(quickAmount);
     toast({
      title: 'Water Added!',
      description: `${quickAmount}ml added to your daily intake.`,
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (ml)"
          aria-label="Water amount in milliliters"
          className="flex-grow"
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || !amount}>
          <Droplet className="mr-2 h-4 w-4" /> Add
        </Button>
      </form>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {QUICK_ADD_AMOUNTS.map(qAmount => (
          <Button 
            key={qAmount} 
            variant="outline" 
            onClick={() => handleQuickAdd(qAmount)}
            disabled={disabled}
            aria-label={`Quick add ${qAmount} ml`}
          >
            + {qAmount} ml
          </Button>
        ))}
      </div>
    </div>
  );
}
