
import type { WaterIntakeRecord } from '@/types';
import { DRINK_TYPES, getDrinkColor, getTotalIntake } from '@/types'; 
import { CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';
import Image from 'next/image';

interface DailyIntakeDisplayProps {
  record: WaterIntakeRecord | undefined;
  goal: number; // This will be the specific goal for the day (from record or calculated)
  viewMode: 'progressBar' | 'imageVisualizer';
}

export function DailyIntakeDisplay({ record, goal, viewMode }: DailyIntakeDisplayProps) {
  const currentDrinks = record?.drinks || [];
  const totalCurrentAmount = getTotalIntake(currentDrinks);
  const currentGoal = goal; 
  const progressPercent = currentGoal > 0 ? Math.min((totalCurrentAmount / currentGoal) * 100, 100) : 0; // Cap at 100 for fill

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

  const renderProgressBarView = () => (
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

  const renderImageVisualizerView = () => {
    const goalAchieved = totalCurrentAmount >= currentGoal && currentGoal > 0;

    return (
      <div className="space-y-3">
        <div className="text-center md:text-left">
          <p className="text-3xl font-bold text-primary">
            {totalCurrentAmount.toLocaleString()}
            <span className="text-lg text-muted-foreground"> / {currentGoal.toLocaleString()} ml</span>
          </p>
        </div>

        <div className="relative w-full aspect-[3/2] max-w-md mx-auto rounded-lg overflow-hidden shadow-lg bg-muted">
          {!goalAchieved && (
            <>
              <Image
                src="https://placehold.co/600x400.png"
                alt="Parched isometric landscape"
                layout="fill"
                objectFit="cover"
                data-ai-hint="isometric cliff"
                priority
              />
              <div
                className="absolute bottom-0 left-0 w-full bg-blue-500/50 transition-all duration-500 ease-out"
                style={{ height: `${progressPercent}%` }}
                aria-hidden="true"
              />
            </>
          )}
          {goalAchieved && (
             <Image
                src="https://placehold.co/600x400.png"
                alt="Intake goal achieved - vibrant landscape"
                layout="fill"
                objectFit="cover"
                data-ai-hint="vibrant landscape"
                priority
              />
          )}
        </div>

        {goalAchieved && (
          <CardDescription className="text-center" style={{ color: 'hsl(var(--chart-1))' }}>
            Goal Achieved! The land is vibrant!
          </CardDescription>
        )}
        {totalCurrentAmount < currentGoal && totalCurrentAmount > 0 && (
           <CardDescription className="text-center text-muted-foreground">
            Nourish the land, keep hydrating!
          </CardDescription>
        )}
         {totalCurrentAmount === 0 && (
           <CardDescription className="text-center text-muted-foreground">
            The land is parched. Log your intake!
          </CardDescription>
        )}
      </div>
    );
  };

  return viewMode === 'imageVisualizer' ? renderImageVisualizerView() : renderProgressBarView();
}
