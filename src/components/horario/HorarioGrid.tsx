
import React, { useState, useEffect } from 'react';
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
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });
  
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);
  
  const [sessionsByCell, setSessionsByCell] = useState<Record<string, ClassSession>>({});
  
  // Process sessions for display
  useEffect(() => {
    const sessionsMap: Record<string, ClassSession> = {};
    
    sessions.forEach(session => {
      try {
        // Parse the session date
        const sessionDate = parseISO(session.date);
        
        // Get date string and hour
        const dateStr = format(sessionDate, 'yyyy-MM-dd');
        const hour = sessionDate.getHours();
        
        // Create a key for this cell
        const cellKey = `${dateStr}-${hour}`;
        sessionsMap[cellKey] = session;
        
        console.log(`Processed session for ${dateStr} at ${hour}:00:`, session);
      } catch (error) {
        console.error('Error processing session:', session, error);
      }
    });
    
    setSessionsByCell(sessionsMap);
  }, [sessions]);
  
  const findSession = (day: Date, hour: number) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const cellKey = `${dayStr}-${hour}`;
    return sessionsByCell[cellKey];
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
      
      <div className="grid grid-cols-8 border-b">
        {timeSlots.map((hour) => (
          <React.Fragment key={`row-${hour}`}>
            <div className="p-2 text-center text-sm border-r bg-blue-50">
              {hour}:00
            </div>
            
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
