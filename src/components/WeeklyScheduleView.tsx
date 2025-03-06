
import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { Clock, Users, User, Trash2 } from 'lucide-react';
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
    return sessions.filter(session => {
      return session.date.startsWith(dateStr);
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
  
  return (
    <div className="grid grid-cols-5 gap-2 bg-white rounded-lg shadow-sm">
      {/* Header with weekdays */}
      {weekDays.map((day, index) => (
        <div key={`header-${index}`} className="text-center p-2 bg-indigo-100 rounded-t-lg font-medium sticky top-0 text-sm border-b border-indigo-200">
          <div className="capitalize font-bold text-indigo-800">{day.dayName}</div>
          <div className="text-indigo-600">{day.dayNumber}</div>
        </div>
      ))}
      
      {/* Day content */}
      {weekDays.map((day, dayIndex) => {
        const daySessions = getSessionsForDay(day.dateStr);
        
        return (
          <div 
            key={`day-${dayIndex}`}
            className="min-h-[120px] p-2 border-r border-indigo-100 hover:bg-indigo-50/50 transition-colors"
          >
            {daySessions.length === 0 ? (
              <div 
                className="h-full flex items-center justify-center text-indigo-300 text-xs cursor-pointer rounded-md border border-dashed border-indigo-200 hover:border-indigo-400 transition-all"
                onClick={() => onAddSession(day.date, 9)} // Default 9 AM for new sessions
              >
                Clique para adicionar aula
              </div>
            ) : (
              <div className="space-y-2">
                {daySessions.map(session => (
                  <div 
                    key={session.id}
                    className="p-2 bg-indigo-100 rounded-md shadow-sm hover:shadow-md transition-all border border-indigo-200"
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
