
import React from 'react';
import { Student } from '@/types';
import { 
  createWeekDays, 
  generateTimeSlots, 
  isSessionInWeek
} from '@/components/schedule/utils';
import { DayHeader } from '@/components/schedule/DayHeader';
import { SessionDisplay } from '@/components/schedule/SessionDisplay';
import { TimeSlot } from '@/components/schedule/TimeSlot';
import { ClassSession } from '@/components/schedule/types';

interface WeeklyScheduleViewProps {
  sessions: ClassSession[];
  students: Student[];
  weekStart: Date;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onAddSession: (day: Date, hour: number) => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  sessions,
  students,
  weekStart,
  onDeleteSession,
  onAddSession
}) => {
  // Create array with weekdays
  const weekDays = createWeekDays(weekStart);
  const timeSlots = generateTimeSlots();
  
  console.log("Rendering with sessions:", sessions);
  console.log("Students available:", students);
  
  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow">
      {/* Header row with days */}
      <div className="grid grid-cols-8 border-b sticky top-0 z-20 bg-white shadow-sm">
        <div className="p-2 text-center font-semibold bg-blue-50 border-r">
          Hora
        </div>
        {weekDays.map((day, index) => (
          <DayHeader key={`header-${index}`} day={day} />
        ))}
      </div>
      
      {/* Time grid */}
      <div className="relative bg-white">
        {/* Time slots and horizontal lines */}
        {timeSlots.map((timeSlot, index) => (
          <TimeSlot 
            key={`time-${index}`} 
            timeSlot={timeSlot} 
            weekDays={weekDays} 
            onAddSession={onAddSession} 
          />
        ))}
        
        {/* Session blocks */}
        {sessions.map((session) => {
          const dayIndex = isSessionInWeek(session, weekDays);
          return (
            <SessionDisplay
              key={session.id}
              session={session}
              dayIndex={dayIndex}
              students={students}
              onDeleteSession={onDeleteSession}
            />
          );
        })}
      </div>
    </div>
  );
};
