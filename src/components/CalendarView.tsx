'use client';

import type { DayContentProps } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import type { WaterIntakeRecord } from '@/types';
import { format } from 'date-fns';

interface CalendarViewProps {
  records: WaterIntakeRecord[];
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  dailyGoal: number;
}

const CustomDayContent = ({ date, displayMonth }: DayContentProps, records: WaterIntakeRecord[], dailyGoal: number) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  // Check if the day is outside the current display month to avoid rendering indicators on them
  if (date.getMonth() !== displayMonth.getMonth()) {
    return <>{date.getDate()}</>;
  }

  const record = records.find(r => r.date === dateStr);
  let indicatorClass = '';

  if (record) {
    if (record.amount >= (record.goal || dailyGoal)) {
      indicatorClass = 'day-indicator-achieved'; // Greenish
    } else if (record.amount > 0) {
      indicatorClass = 'day-indicator-partial'; // Bluish
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
      month={selectedDate} // Control the displayed month
      onMonthChange={(month) => onDateSelect(new Date(month.getFullYear(), month.getMonth(), selectedDate.getDate()))} // Keep day when month changes
      components={{
        DayContent: renderDayContent
      }}
      modifiers={{
        // Future: add custom modifiers for styling achieved/partial days if needed beyond dots
      }}
      modifiersClassNames={{
        // Future: map modifiers to CSS classes
      }}
      ISOWeek
      showOutsideDays
    />
  );
}
