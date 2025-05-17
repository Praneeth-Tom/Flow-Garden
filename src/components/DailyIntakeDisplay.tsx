import type { WaterIntakeRecord } from '@/types';
import { Progress } from '@/components/ui/progress';
import { CardDescription } from '@/components/ui/card'; // Used for goal met message

interface DailyIntakeDisplayProps {
  record: WaterIntakeRecord | undefined; // Record for the selected date
  goal: number; // Default goal if no record exists for the day
}

export function DailyIntakeDisplay({ record, goal }: DailyIntakeDisplayProps) {
  const currentAmount = record?.amount || 0;
  const currentGoal = record?.goal || goal;
  const progress = currentGoal > 0 ? (currentAmount / currentGoal) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="text-center md:text-left">
        <p className="text-3xl font-bold text-primary">
          {currentAmount.toLocaleString()}
          <span className="text-lg text-muted-foreground"> / {currentGoal.toLocaleString()} ml</span>
        </p>
      </div>
      <Progress value={progress} className="w-full h-3" aria-label={`Water intake progress: ${Math.round(progress)}%`} />
      {currentAmount >= currentGoal && currentAmount > 0 && (
        <CardDescription className="text-center text-green-600 font-medium">
          Goal Achieved! Keep it up!
        </CardDescription>
      )}
      {currentAmount < currentGoal && currentAmount > 0 && (
         <CardDescription className="text-center text-muted-foreground">
          Keep hydrating!
        </CardDescription>
      )}
       {currentAmount === 0 && (
         <CardDescription className="text-center text-muted-foreground">
          No intake logged for this day yet.
        </CardDescription>
      )}
    </div>
  );
}
