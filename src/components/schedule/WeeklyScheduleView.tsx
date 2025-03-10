
import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { DayHeader } from './DayHeader';
import { TimeSlot } from './TimeSlot';
import { SessionDisplay } from './SessionDisplay';

interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes: string | null;
}

interface WeeklyScheduleViewProps {
  sessions: ClassSession[];
  students: Student[];
  weekStart: Date;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onAddSession: (day: Date, hour: number) => void;
}

// Constants for the schedule display
const HOURS_START = 8; // 8 AM
const HOURS_END = 20; // 8 PM
const CELL_HEIGHT = 25; // Height of each half-hour cell in pixels

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  sessions,
  students,
  weekStart,
  onDeleteSession,
  onAddSession
}) => {
  // Create array with weekdays
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });
  
  // Generate time slots (8:00 to 20:00, every 30 minutes)
  const timeSlots = [];
  for (let hour = HOURS_START; hour < HOURS_END; hour++) {
    timeSlots.push(hour + ':00');
    timeSlots.push(hour + ':30');
  }

  const handleAddSession = (dayIndex: number, hour: number) => {
    const date = addDays(weekStart, dayIndex);
    date.setHours(hour);
    onAddSession(date, hour);
  };
  
  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow">
      {/* Header row with days */}
      <div className="grid grid-cols-8 border-b sticky top-0 z-20 bg-white shadow-sm">
        <div className="p-2 text-center font-semibold bg-blue-50 border-r">
          Hora
        </div>
        {weekDays.map((day, index) => (
          <DayHeader key={`header-${index}`} date={day.date} />
        ))}
      </div>
      
      {/* Time grid */}
      <div className="relative">
        {/* Time slots and horizontal lines */}
        {timeSlots.map((timeSlot, index) => (
          <div 
            key={`time-${index}`}
            className="grid grid-cols-8 border-b border-gray-100"
            style={{ height: `${CELL_HEIGHT}px` }}
          >
            <div className="text-xs text-gray-500 p-1 border-r text-center">
              {timeSlot}
            </div>
            
            {/* Empty day cells */}
            {Array.from({ length: 7 }, (_, dayIndex) => (
              <TimeSlot 
                key={`cell-${dayIndex}`}
                time={timeSlot}
                dayIndex={dayIndex}
                onAddSession={handleAddSession}
              />
            ))}
          </div>
        ))}
        
        {/* Session blocks */}
        {sessions.map((session) => (
          <SessionDisplay
            key={session.id}
            session={session}
            weekDays={weekDays}
            students={students}
            onDeleteSession={onDeleteSession}
            hoursStart={HOURS_START}
            cellHeight={CELL_HEIGHT}
          />
        ))}
      </div>
    </div>
  );
};
