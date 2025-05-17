
import type { WaterIntakeRecord, DrinkEntry } from '@/types';
import { DRINK_TYPES, getDrinkColor, getTotalIntake } from '@/types'; // Assuming DRINK_TYPES and getDrinkColor are here
import { CardDescription } from '@/components/ui/card';

interface DailyIntakeDisplayProps {
  record: WaterIntakeRecord | undefined;
  goal: number;
}

export function DailyIntakeDisplay({ record, goal }: DailyIntakeDisplayProps) {
  const currentDrinks = record?.drinks || [];
  const totalCurrentAmount = getTotalIntake(currentDrinks);
  const currentGoal = record?.goal || goal;
  const progressPercent = currentGoal > 0 ? (totalCurrentAmount / currentGoal) * 100 : 0;

  // Sort drinks for consistent order in the bar, e.g., by DRINK_TYPES order
  const sortedDrinks = currentDrinks.slice().sort((a, b) => {
    const indexA = DRINK_TYPES.findIndex(dt => dt.name === a.type);
    const indexB = DRINK_TYPES.findIndex(dt => dt.name === b.type);
    return indexA - indexB;
  });

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
        {sortedDrinks.map(drink => {
          const drinkPercentageOfGoal = currentGoal > 0 ? (drink.amount / currentGoal) * 100 : 0;
          return (
            <div
              key={drink.type}
              style={{
                width: `${drinkPercentageOfGoal}%`,
                backgroundColor: getDrinkColor(drink.type)
              }}
              className="h-full transition-all duration-300 ease-in-out"
              title={`${drink.type}: ${drink.amount}ml`}
            ></div>
          );
        })}
      </div>

      {totalCurrentAmount >= currentGoal && totalCurrentAmount > 0 && (
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
