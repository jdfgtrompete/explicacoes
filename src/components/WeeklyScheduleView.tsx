
import React from 'react';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { Clock, Users, User, Trash2 } from 'lucide-react';
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
      dayName: format(day, 'EEE', { locale: ptBR }),
      dayNumber: format(day, 'd', { locale: ptBR }),
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });
  
  console.log("Rendering with sessions:", sessions);
  console.log("Students available:", students);
  
  // Function to get student name by ID
  const getStudentName = (studentId: string): string => {
    if (!studentId) return 'Aluno Desconhecido';
    
    console.log("Looking for student with ID:", studentId);
    const student = students.find(s => s.id === studentId);
    console.log("Found student:", student);
    return student ? student.name : 'Aluno Desconhecido';
  };

  // Function to get list of students for a group session
  const getSessionStudents = (sessionStudentId: string): string[] => {
    if (!sessionStudentId) return ['Aluno Desconhecido'];
    
    if (!sessionStudentId.includes(',')) {
      return [getStudentName(sessionStudentId)];
    }
    
    const studentIds = sessionStudentId.split(',');
    return studentIds.map(id => getStudentName(id.trim()));
  };
  
  // Parse session date and time
  const parseSessionDateTime = (dateStr: string): Date => {
    try {
      return new Date(dateStr);
    } catch (e) {
      console.error("Error parsing datetime:", dateStr, e);
      return new Date();
    }
  };
  
  // Format time from date string
  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return format(date, 'HH:mm');
    } catch (e) {
      console.error("Error formatting time:", dateStr, e);
      return "00:00";
    }
  };
  
  // Calculate position for a session
  const getSessionStyle = (session: ClassSession, dayIndex: number) => {
    const sessionDate = parseSessionDateTime(session.date);
    const sessionHour = sessionDate.getHours();
    const sessionMinute = sessionDate.getMinutes();
    
    // Calculate position based on time
    const hourPosition = sessionHour - HOURS_START;
    const minutePosition = sessionMinute / 30; // Each 30 min is a cell
    const timePosition = (hourPosition * 2 + minutePosition) * CELL_HEIGHT;
    
    // Calculate height based on duration (convert hours to pixels)
    const heightCells = session.duration * 2; // Each hour is 2 cells
    const heightValue = heightCells * CELL_HEIGHT;
    
    // Column width calculation (7 days, each taking equal space)
    const leftPosition = (dayIndex * (100 / 7)) + '%';
    const widthValue = (100 / 7) - 0.5 + '%'; // Subtract a small amount for spacing
    
    return {
      position: 'absolute' as const,
      top: `${timePosition}px`,
      height: `${heightValue}px`,
      left: leftPosition,
      width: widthValue,
      zIndex: 10
    };
  };

  // Get background color based on session type
  const getSessionColor = (session: ClassSession) => {
    return session.type === 'individual' 
      ? 'bg-blue-100 border-blue-400 hover:bg-blue-200'
      : 'bg-green-100 border-green-400 hover:bg-green-200';
  };
  
  // Generate time slots (8:00 to 20:00, every 30 minutes)
  const timeSlots = [];
  for (let hour = HOURS_START; hour < HOURS_END; hour++) {
    timeSlots.push(hour + ':00');
    timeSlots.push(hour + ':30');
  }
  
  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow">
      {/* Header row with days */}
      <div className="grid grid-cols-8 border-b sticky top-0 z-20 bg-white shadow-sm">
        <div className="p-2 text-center font-semibold bg-blue-50 border-r">
          Hora
        </div>
        {weekDays.map((day, index) => (
          <div 
            key={`header-${index}`} 
            className="p-2 text-center font-semibold bg-blue-50 border-r"
          >
            <div className="text-blue-800">{day.dayName}</div>
            <div className="text-blue-700">{day.dayNumber}</div>
          </div>
        ))}
      </div>
      
      {/* Time grid */}
      <div className="relative bg-white">
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
              <div 
                key={`cell-${index}-${dayIndex}`}
                className="border-r relative border-gray-100"
                onClick={() => {
                  const hour = parseInt(timeSlot.split(':')[0]);
                  const minute = parseInt(timeSlot.split(':')[1]);
                  const date = addDays(weekStart, dayIndex);
                  date.setHours(hour, minute);
                  onAddSession(date, hour);
                }}
              />
            ))}
          </div>
        ))}
        
        {/* Session blocks */}
        {sessions.map((session) => {
          const sessionDate = parseSessionDateTime(session.date);
          // Find which day column this session belongs to
          const dayIndex = weekDays.findIndex(day => 
            isSameDay(day.date, sessionDate)
          );
          
          if (dayIndex === -1) return null; // Skip if not in current week
          
          const studentName = session.type === 'individual' 
            ? getStudentName(session.student_id)
            : getSessionStudents(session.student_id).join(', ');
            
          console.log("Rendering session for student:", studentName);
          
          return (
            <div 
              key={session.id}
              style={getSessionStyle(session, dayIndex)}
              className={cn(
                "absolute rounded border px-2 py-1 shadow-sm",
                getSessionColor(session),
                "hover:shadow transition-shadow overflow-hidden"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-xs truncate max-w-[80%]">
                  {studentName}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                <span>{formatTime(session.date)}</span>
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
              
              {session.notes && session.duration >= 1 && (
                <div className="text-[10px] mt-1 bg-white/60 p-1 rounded truncate">
                  {session.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
