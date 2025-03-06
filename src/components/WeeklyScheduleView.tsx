
import React from 'react';
import { format, addDays, parse, differenceInMinutes, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { Clock, Users, User, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

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
  onDeleteSession: (sessionId: string) => void;
  onAddSession: (day: Date, hour: number) => void;
}

// Constants for the schedule display
const HOURS_START = 8; // 8 AM
const HOURS_END = 20; // 8 PM
const HOUR_HEIGHT = 50; // Height of each hour row in pixels

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  sessions,
  students,
  weekStart,
  onDeleteSession,
  onAddSession
}) => {
  // Create array with weekdays (including weekends)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dayName: format(day, 'EEE', { locale: ptBR }),
      dayNumber: format(day, 'd', { locale: ptBR }),
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });
  
  // Function to get student name by ID
  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Aluno Desconhecido';
  };

  // Function to get list of students for a group session
  const getSessionStudents = (sessionStudentId: string): string[] => {
    if (!sessionStudentId.includes(',')) {
      return [getStudentName(sessionStudentId)];
    }
    
    const studentIds = sessionStudentId.split(',');
    return studentIds.map(id => getStudentName(id.trim()));
  };
  
  // Get sessions for a specific day
  const getSessionsForDay = (dateStr: string) => {
    return sessions.filter(session => {
      // Parse the session date
      const sessionDate = parseSessionDateTime(session.date);
      // Format to match the day string format
      const sessionDateStr = format(sessionDate, 'yyyy-MM-dd');
      // Return true if dates match
      return sessionDateStr === dateStr;
    });
  };
  
  // Parse time from session date string
  const getSessionTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'HH:mm');
    } catch (e) {
      console.error("Error parsing date:", dateStr, e);
      return "00:00";
    }
  };

  // Parse date and time from date string
  const parseSessionDateTime = (dateStr: string): Date => {
    try {
      return new Date(dateStr);
    } catch (e) {
      console.error("Error parsing datetime:", dateStr, e);
      return new Date();
    }
  };
  
  // Calculate position for a session
  const getSessionStyle = (session: ClassSession, dayColumn: number) => {
    const sessionDate = parseSessionDateTime(session.date);
    const sessionHour = sessionDate.getHours();
    const sessionMinute = sessionDate.getMinutes();
    
    // Calculate top position based on time
    const timePosition = (sessionHour - HOURS_START) * HOUR_HEIGHT + (sessionMinute / 60) * HOUR_HEIGHT;
    
    // Calculate height based on duration
    const heightValue = session.duration * HOUR_HEIGHT;
    
    return {
      position: 'absolute' as const,
      top: `${timePosition}px`,
      height: `${heightValue}px`,
      left: '2px',
      right: '2px',
      zIndex: 10
    };
  };

  // Get background color based on session type
  const getSessionColor = (session: ClassSession) => {
    if (session.type === 'individual') {
      return 'bg-blue-100 border-blue-300';
    } else {
      return 'bg-green-100 border-green-300';
    }
  };
  
  return (
    <div className="overflow-auto h-full border border-gray-300 rounded-lg">
      <div className="min-w-[800px] relative">
        {/* Header row with days */}
        <div className="grid grid-cols-8 border-b sticky top-0 z-20 bg-white">
          <div className="p-2 border-r font-bold text-center bg-blue-600 text-white">
            Hora
          </div>
          {weekDays.map((day, index) => (
            <div 
              key={`header-${index}`} 
              className="p-2 border-r font-bold text-center bg-blue-600 text-white"
            >
              <div>{day.dayName}</div>
              <div>{day.dayNumber}</div>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="relative">
          {/* Hour rows */}
          {Array.from({ length: HOURS_END - HOURS_START }, (_, i) => {
            const hour = HOURS_START + i;
            return (
              <div 
                key={`hour-${hour}`} 
                className="grid grid-cols-8 border-b"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {/* Hour cell */}
                <div className="border-r p-1 text-center font-medium bg-gray-100">
                  {hour}:00
                </div>
                
                {/* Day cells */}
                {weekDays.map((day, dayIndex) => (
                  <div 
                    key={`cell-${hour}-${dayIndex}`}
                    className="border-r relative hover:bg-blue-50 cursor-pointer"
                    onClick={() => onAddSession(day.date, hour)}
                  >
                    {/* This is just the empty cell */}
                  </div>
                ))}
              </div>
            );
          })}
          
          {/* Session blocks */}
          {weekDays.map((day, dayIndex) => {
            const daySessions = getSessionsForDay(day.dateStr);
            return (
              <React.Fragment key={`sessions-day-${dayIndex}`}>
                {daySessions.map(session => (
                  <div 
                    key={session.id}
                    style={getSessionStyle(session, dayIndex)}
                    className={cn(
                      "absolute rounded border shadow-sm p-1 mx-1",
                      getSessionColor(session),
                      "hover:shadow-md transition-shadow overflow-hidden",
                      // Position in the correct day column (skip the first hour column + the day index)
                      `left-[calc(${(dayIndex + 1) * (100 / 8)}%)] w-[calc(${100 / 8}% - 8px)]`
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-xs truncate max-w-[80%]">
                        {session.type === 'individual' 
                          ? getStudentName(session.student_id)
                          : getSessionStudents(session.student_id).join(', ')
                        }
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <Trash2 size={10} />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-1">
                      <Clock size={10} />
                      <span>{getSessionTime(session.date)}</span>
                      <span className="mx-1">•</span>
                      <span>{session.duration}h</span>
                    </div>
                    
                    <div className="flex items-center text-[10px] text-gray-600 mt-1">
                      {session.type === 'individual' ? (
                        <User size={10} className="mr-1" />
                      ) : (
                        <Users size={10} className="mr-1" />
                      )}
                      <span>{session.type === 'individual' ? 'Individual' : 'Coletiva'}</span>
                    </div>
                    
                    {session.notes && (
                      <div className="text-[10px] mt-1 bg-white/60 p-1 rounded truncate">
                        {session.notes}
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
