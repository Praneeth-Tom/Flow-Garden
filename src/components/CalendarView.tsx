
'use client';

import type { DayContentProps } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import type { WaterIntakeRecord } from '@/types';
import { getTotalIntake } from '@/types';
import { format } from 'date-fns';

interface CalendarViewProps {
  records: WaterIntakeRecord[];
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  dailyGoal: number; // This is the overall current calculated daily goal, used as fallback
}

const CustomDayContent = ({ date, displayMonth }: DayContentProps, records: WaterIntakeRecord[], overallDailyGoal: number) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  if (date.getMonth() !== displayMonth.getMonth()) {
    return <>{date.getDate()}</>;
  }

  const record = records.find(r => r.date === dateStr);
  let indicatorClass = '';

  if (record) {
    const totalAmount = getTotalIntake(record.drinks);
    // Use the goal stored in the record for that specific day, or fallback to the overallDailyGoal
    const currentGoal = record.goal || overallDailyGoal; 
    if (totalAmount >= currentGoal && currentGoal > 0) {
      indicatorClass = 'day-indicator-achieved';
    } else if (totalAmount > 0) {
      indicatorClass = 'day-indicator-partial';
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <span>{date.getDate()}</span>
      {indicatorClass && (
        <span
          className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${indicatorClass}`}
          aria-hidden="true"
        ></span>
      )}
    </div>
  );
};


export function CalendarView({ records, selectedDate, onDateSelect, dailyGoal }: CalendarViewProps) {
  
  const renderDayContent: (props: DayContentProps) => JSX.Element = (props) => 
    CustomDayContent(props, records, dailyGoal);

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="rounded-md"
      month={selectedDate}
      onMonthChange={(month) => onDateSelect(new Date(month.getFullYear(), month.getMonth(), selectedDate.getDate()))}
      components={{
        DayContent: renderDayContent
      }}
      ISOWeek
      showOutsideDays
    />
  );
}
