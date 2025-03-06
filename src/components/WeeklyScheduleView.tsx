
import React from 'react';
import { format, addDays, parse, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { Clock, Users, User, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';

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
const MINUTES_PER_PIXEL = 1.5; // How many minutes per pixel height

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  sessions,
  students,
  weekStart,
  onDeleteSession,
  onAddSession
}) => {
  // Create array with weekdays (excluding weekends)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dayName: format(day, 'EEEE', { locale: ptBR }),
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
  const getSessionStudents = (sessionStudentId: string) => {
    if (!sessionStudentId.includes(',')) {
      return [getStudentName(sessionStudentId)];
    }
    
    const studentIds = sessionStudentId.split(',');
    return studentIds.map(id => getStudentName(id.trim()));
  };
  
  // Get sessions for a specific day
  const getSessionsForDay = (dateStr: string) => {
    return sessions.filter(session => session.date.startsWith(dateStr))
      .sort((a, b) => {
        const timeA = getSessionTime(a.date);
        const timeB = getSessionTime(b.date);
        return timeA.localeCompare(timeB);
      });
  };
  
  // Parse time from session date string
  const getSessionTime = (dateStr: string) => {
    const sessionTimeMatch = dateStr.match(/\d\d:\d\d/);
    
    if (sessionTimeMatch) {
      return sessionTimeMatch[0];
    } else if (dateStr.includes('T')) {
      const timePart = dateStr.split('T')[1];
      if (timePart) {
        return timePart.substring(0, 5);
      }
    }
    
    return '00:00';
  };

  // Parse date and time from date string
  const parseSessionDateTime = (dateStr: string): Date => {
    if (dateStr.includes('T')) {
      return new Date(dateStr);
    }
    
    const datePart = dateStr.split(' ')[0];
    const timePart = getSessionTime(dateStr);
    return parse(`${datePart} ${timePart}`, 'yyyy-MM-dd HH:mm', new Date());
  };
  
  // Calculate position and height for a session
  const getSessionStyle = (session: ClassSession) => {
    const sessionDate = parseSessionDateTime(session.date);
    const sessionHour = sessionDate.getHours();
    const sessionMinute = sessionDate.getMinutes();
    
    // Calculate top position based on time
    const minutesSinceDayStart = (sessionHour - HOURS_START) * 60 + sessionMinute;
    const topPosition = minutesSinceDayStart / MINUTES_PER_PIXEL;
    
    // Calculate height based on duration
    const durationInMinutes = session.duration * 60;
    const height = durationInMinutes / MINUTES_PER_PIXEL;
    
    return {
      top: `${topPosition}px`,
      height: `${height}px`,
      position: 'absolute' as const,
      width: '95%',
      left: '2.5%'
    };
  };
  
  return (
    <div className="grid grid-cols-5 gap-1 bg-white rounded-lg shadow-sm">
      {/* Header with weekdays */}
      {weekDays.map((day, index) => (
        <div key={`header-${index}`} className="text-center p-1 bg-indigo-100 rounded-t-lg font-medium sticky top-0 text-sm border-b border-indigo-200">
          <div className="capitalize font-bold text-indigo-800">{day.dayName}</div>
          <div className="text-indigo-600">{day.dayNumber}</div>
        </div>
      ))}
      
      {/* Day content */}
      {weekDays.map((day, dayIndex) => {
        const daySessions = getSessionsForDay(day.dateStr);
        const dayHeight = (HOURS_END - HOURS_START) * 60 / MINUTES_PER_PIXEL;
        
        return (
          <div 
            key={`day-${dayIndex}`}
            className="relative border-r border-indigo-100 hover:bg-indigo-50/50 transition-colors"
            style={{ height: `${dayHeight}px` }}
          >
            {/* Time indicators */}
            {Array.from({ length: HOURS_END - HOURS_START }, (_, i) => (
              <div 
                key={`time-${i}`}
                className="border-t border-indigo-100 text-[9px] text-indigo-300"
                style={{ 
                  position: 'absolute',
                  top: `${i * 60 / MINUTES_PER_PIXEL}px`,
                  width: '100%',
                  pointerEvents: 'none'
                }}
              >
                {i === 0 ? null : <span className="ml-1">{HOURS_START + i}:00</span>}
              </div>
            ))}

            {/* Empty state */}
            {daySessions.length === 0 ? (
              <Button
                variant="ghost"
                onClick={() => onAddSession(day.date, 9)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-auto p-1 opacity-50 hover:opacity-100"
              >
                <Plus size={14} />
              </Button>
            ) : (
              <>
                {daySessions.map(session => (
                  <div 
                    key={session.id}
                    style={getSessionStyle(session)}
                    className="p-1 bg-indigo-100 rounded-md shadow-sm hover:shadow-md transition-all border border-indigo-200 overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-xs text-indigo-800 truncate max-w-[120px]">
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
                    
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600 mt-1">
                      <Clock size={10} />
                      <span>{getSessionTime(session.date)}</span>
                      <span className="mx-1">•</span>
                      <span>{session.duration}h</span>
                    </div>
                    
                    <div className="flex items-center text-[10px] text-indigo-600 mt-1">
                      {session.type === 'individual' ? (
                        <User size={10} className="mr-1" />
                      ) : (
                        <Users size={10} className="mr-1" />
                      )}
                      <span>{session.type === 'individual' ? 'Individual' : 'Coletiva'}</span>
                    </div>
                    
                    {session.notes && (
                      <div className="text-[10px] text-indigo-500 mt-1 bg-indigo-50 p-1 rounded truncate">
                        {session.notes}
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => onAddSession(day.date, 9)}
                  className="absolute bottom-2 right-2 h-auto p-1 opacity-50 hover:opacity-100"
                >
                  <Plus size={12} />
                </Button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
