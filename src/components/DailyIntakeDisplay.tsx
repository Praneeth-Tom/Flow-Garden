
import type { WaterIntakeRecord, DrinkEntry } from '@/types';
import { DRINK_TYPES, getDrinkColor, getTotalIntake } from '@/types'; 
import { CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

interface DailyIntakeDisplayProps {
  record: WaterIntakeRecord | undefined;
  goal: number; // This will be the specific goal for the day (from record or calculated)
}

export function DailyIntakeDisplay({ record, goal }: DailyIntakeDisplayProps) {
  const currentDrinks = record?.drinks || [];
  const totalCurrentAmount = getTotalIntake(currentDrinks);
  // Use the goal passed in, which is either record.goal or the overall calculatedDailyGoal
  const currentGoal = goal; 
  const progressPercent = currentGoal > 0 ? (totalCurrentAmount / currentGoal) * 100 : 0;

  const aggregatedDrinksByType = useMemo(() => {
    if (!currentDrinks.length) return [];

    const aggregation: { [type: string]: { totalAmount: number, type: string } } = {};
    currentDrinks.forEach(drink => {
      if (!aggregation[drink.type]) {
        aggregation[drink.type] = { totalAmount: 0, type: drink.type };
      }
      aggregation[drink.type].totalAmount += drink.amount;
    });
    
    return DRINK_TYPES
      .map(dt => aggregation[dt.name])
      .filter(Boolean) as { totalAmount: number, type: string }[];
  }, [currentDrinks]);

  return (
    <div className="space-y-3">
      <div className="text-center md:text-left">
        <p className="text-3xl font-bold text-primary">
          {totalCurrentAmount.toLocaleString()}
          <span className="text-lg text-muted-foreground"> / {currentGoal.toLocaleString()} ml</span>
        </p>
      </div>
      
      <div 
        className="w-full h-3 rounded-full bg-secondary overflow-hidden flex"
        role="progressbar"
        aria-valuenow={totalCurrentAmount}
        aria-valuemin={0}
        aria-valuemax={currentGoal}
        aria-label={`Water intake progress: ${Math.round(progressPercent)}%`}
      >
        {aggregatedDrinksByType.map(aggDrink => {
          const drinkPercentageOfGoal = currentGoal > 0 ? (aggDrink.totalAmount / currentGoal) * 100 : 0;
          return (
            <div
              key={aggDrink.type}
              style={{
                width: `${drinkPercentageOfGoal}%`,
                backgroundColor: getDrinkColor(aggDrink.type)
              }}
              className="h-full transition-all duration-300 ease-in-out"
              title={`${aggDrink.type}: ${aggDrink.totalAmount}ml`}
            ></div>
          );
        })}
      </div>

      {totalCurrentAmount >= currentGoal && totalCurrentAmount > 0 && currentGoal > 0 && (
        <CardDescription className="text-center" style={{ color: 'hsl(var(--chart-1))' }}>
          Goal Achieved! Keep it up!
        </CardDescription>
      )}
      {totalCurrentAmount < currentGoal && totalCurrentAmount > 0 && (
         <CardDescription className="text-center text-muted-foreground">
          Keep hydrating!
        </CardDescription>
      )}
       {totalCurrentAmount === 0 && (
         <CardDescription className="text-center text-muted-foreground">
          No intake logged for this day yet.
        </CardDescription>
      )}
    </div>
  );
}
