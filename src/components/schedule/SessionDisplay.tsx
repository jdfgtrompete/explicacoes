
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Clock, Users, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Student } from '@/types';

interface SessionDisplayProps {
  session: {
    id: string;
    student_id: string;
    date: string;
    duration: number;
    type: 'individual' | 'group';
    notes: string | null;
  };
  dayIndex: number;
  weekDays: {
    date: Date;
    dayName: string;
    dayNumber: string;
    dateStr: string;
  }[];
  students: Student[];
  onDeleteSession: (sessionId: string) => void;
  hoursStart: number;
  cellHeight: number;
}

export const SessionDisplay: React.FC<SessionDisplayProps> = ({
  session,
  dayIndex,
  weekDays,
  students,
  onDeleteSession,
  hoursStart,
  cellHeight
}) => {
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
  
  // Get student name by ID
  const getStudentName = (studentId: string): string => {
    if (!studentId) return 'Aluno Desconhecido';
    
    console.log("Looking for student with ID:", studentId);
    const student = students.find(s => s.id === studentId);
    console.log("Found student:", student);
    return student ? student.name : 'Aluno Desconhecido';
  };

  // Get list of students for a group session
  const getSessionStudents = (sessionStudentId: string): string[] => {
    if (!sessionStudentId) return ['Aluno Desconhecido'];
    
    if (!sessionStudentId.includes(',')) {
      return [getStudentName(sessionStudentId)];
    }
    
    const studentIds = sessionStudentId.split(',');
    return studentIds.map(id => getStudentName(id.trim()));
  };
  
  // Calculate position for a session
  const getSessionStyle = () => {
    const sessionDate = parseSessionDateTime(session.date);
    const sessionHour = sessionDate.getHours();
    const sessionMinute = sessionDate.getMinutes();
    
    // Calculate position based on time
    const hourPosition = sessionHour - hoursStart;
    const minutePosition = sessionMinute / 30; // Each 30 min is a cell
    const timePosition = (hourPosition * 2 + minutePosition) * cellHeight;
    
    // Calculate height based on duration (convert hours to pixels)
    const heightCells = session.duration * 2; // Each hour is 2 cells
    const heightValue = heightCells * cellHeight;
    
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
  const getSessionColor = () => {
    return session.type === 'individual' 
      ? 'bg-blue-100 border-blue-400 hover:bg-blue-200'
      : 'bg-green-100 border-green-400 hover:bg-green-200';
  };
  
  const sessionDate = parseSessionDateTime(session.date);
  
  // Find which day column this session belongs to
  const validDayIndex = weekDays.findIndex(day => 
    isSameDay(day.date, sessionDate)
  );
  
  if (validDayIndex === -1) return null; // Skip if not in current week
  
  const studentName = session.type === 'individual' 
    ? getStudentName(session.student_id)
    : getSessionStudents(session.student_id).join(', ');
    
  console.log("Rendering session for student:", studentName);
  
  return (
    <div 
      style={getSessionStyle()}
      className={cn(
        "absolute rounded border px-2 py-1 shadow-sm",
        getSessionColor(),
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
};
