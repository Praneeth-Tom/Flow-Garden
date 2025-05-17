
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

// WaveSurfaceSVG Component for the animated wave
// The fill for this wave should be slightly more opaque or a different shade than the main water body
const WaveSurfaceSVG = () => (
  <svg
    width="100%"
    height="20px" // Visual height of the wave effect
    viewBox="0 0 100 20" // Width of one wave cycle is 100, height is 20
    preserveAspectRatio="none" // Stretch to fill width, maintain aspect ratio for height
    style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
  >
    <defs>
      <pattern id="wavePattern" patternUnits="userSpaceOnUse" width="100" height="20" x="0" y="0">
        {/* Wave: starts at mid-height, crests, troughs, ends at mid-height. Fills downwards. */}
        {/* M0,10: Start middle height. Q25,0: Crest. 50,10: Mid. T100,10: Next mid. V20 H0 Z: Fill to bottom. */}
        <path d="M0 10 Q25 0 50 10 T100 10 V20 H0 Z" fill="rgba(59, 130, 246, 0.7)" />
      </pattern>
    </defs>
    {/* Rect is wider than SVG to allow pattern to scroll continuously */}
    <rect
      width="200%" 
      height="100%"
      fill="url(#wavePattern)"
      className="wave-rect-animated" // Apply animation via CSS class
    />
  </svg>
);


export function DailyIntakeDisplay({ record, goal, viewMode }: DailyIntakeDisplayProps) {
  const currentDrinks = record?.drinks || [];
  const totalCurrentAmount = getTotalIntake(currentDrinks);
  const currentGoal = goal; 
  const progressPercent = currentGoal > 0 ? Math.min((totalCurrentAmount / currentGoal) * 100, 100) : 0;

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
              {progressPercent > 0 && (
                <div // Water body div
                  className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-out"
                  style={{
                    height: `${progressPercent}%`,
                    backgroundColor: 'rgba(59, 130, 246, 0.3)', // Lighter blue for water body
                    overflow: 'hidden', // Clip wave if it extends
                  }}
                  aria-hidden="true"
                >
                  {/* WaveSurfaceSVG is positioned at the top of this div */}
                  <WaveSurfaceSVG />
                </div>
              )}
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

