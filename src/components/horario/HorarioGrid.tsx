
import React, { useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { toast } from 'sonner';
import { HorarioCell } from './HorarioCell';
import { HorarioSessionPopover } from './HorarioSessionPopover';

interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes: string | null;
}

interface HorarioGridProps {
  weekStart: Date;
  sessions: ClassSession[];
  students: Student[];
  onAddSession: (sessionData: {
    studentId: string;
    date: Date;
    duration: number;
    type: 'individual' | 'group';
    notes: string;
  }) => Promise<boolean>;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

export const HorarioGrid: React.FC<HorarioGridProps> = ({
  weekStart,
  sessions,
  students,
  onAddSession,
  onDeleteSession
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    day: Date;
    hour: number;
    sessionId?: string;
  } | null>(null);
  
  // Create array with weekdays
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });
  
  // Generate time slots (8:00 to 20:00)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);
  
  // Find session at specific day and hour
  const findSession = (day: Date, hour: number) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    
    return sessions.find(session => {
      // Parse the session date string to a Date object
      const sessionDate = session.date.includes('T') 
        ? parseISO(session.date)
        : parseISO(`${session.date}T00:00:00`);
      
      const sessionHour = sessionDate.getHours();
      const sessionDayStr = format(sessionDate, 'yyyy-MM-dd');
      
      // Check if the day matches and the hour matches
      return sessionDayStr === dayStr && (sessionHour === hour || sessionHour === 0);
    });
  };
  
  const handleCellClick = (day: Date, hour: number) => {
    const session = findSession(day, hour);
    setSelectedCell({
      day,
      hour,
      sessionId: session?.id
    });
  };
  
  const handleClosePopover = () => {
    setSelectedCell(null);
  };
  
  const handleAddSession = async (sessionData: {
    studentId: string;
    duration: number;
    type: 'individual' | 'group';
    notes: string;
  }) => {
    if (!selectedCell) return;
    
    const sessionDate = new Date(selectedCell.day);
    sessionDate.setHours(selectedCell.hour, 0, 0, 0);
    
    const success = await onAddSession({
      ...sessionData,
      date: sessionDate
    });
    
    if (success) {
      toast.success('Horário adicionado com sucesso!');
      setSelectedCell(null);
    }
  };
  
  const handleDeleteSession = async () => {
    if (!selectedCell?.sessionId) return;
    
    await onDeleteSession(selectedCell.sessionId);
    toast.success('Horário removido com sucesso!');
    setSelectedCell(null);
  };
  
  return (
    <div className="relative overflow-auto">
      {/* Header row with days */}
      <div className="grid grid-cols-8 border-b sticky top-0 z-10 bg-white">
        <div className="p-2 text-center font-medium bg-blue-50 border-r">
          Hora
        </div>
        {weekDays.map((day, index) => (
          <div 
            key={`header-${index}`}
            className="p-2 text-center font-medium bg-blue-50 border-r"
          >
            <div className="text-blue-800 capitalize">
              {format(day.date, 'EEEE', { locale: ptBR })}
            </div>
            <div className="text-blue-700">
              {format(day.date, 'd', { locale: ptBR })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time grid */}
      <div className="grid grid-cols-8 border-b">
        {timeSlots.map((hour) => (
          <React.Fragment key={`row-${hour}`}>
            {/* Hour column */}
            <div className="p-2 text-center text-sm border-r bg-blue-50">
              {hour}:00
            </div>
            
            {/* Day cells */}
            {weekDays.map((day, dayIndex) => {
              const session = findSession(day.date, hour);
              
              return (
                <HorarioCell
                  key={`cell-${dayIndex}-${hour}`}
                  session={session}
                  students={students}
                  onClick={() => handleCellClick(day.date, hour)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* Session Popover */}
      {selectedCell && (
        <HorarioSessionPopover
          open={selectedCell !== null}
          onClose={handleClosePopover}
          day={selectedCell.day}
          hour={selectedCell.hour}
          students={students}
          session={selectedCell.sessionId ? 
            sessions.find(s => s.id === selectedCell.sessionId) : 
            undefined
          }
          onAddSession={handleAddSession}
          onDeleteSession={handleDeleteSession}
        />
      )}
    </div>
  );
};
