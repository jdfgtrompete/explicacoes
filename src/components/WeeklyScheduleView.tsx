
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

// Hours from 8 AM to 8 PM
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  sessions,
  students,
  weekStart,
  onDeleteSession,
  onAddSession
}) => {
  // Criar um array com os dias da semana (excluindo finais de semana)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dayName: format(day, 'EEEE', { locale: ptBR }),
      dayNumber: format(day, 'd', { locale: ptBR }),
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });
  
  // Função para obter o nome do aluno pelo ID
  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Aluno Desconhecido';
  };

  // Função para obter a lista de alunos para uma sessão em grupo
  const getSessionStudents = (sessionStudentId: string) => {
    if (!sessionStudentId.includes(',')) {
      return [getStudentName(sessionStudentId)];
    }
    
    const studentIds = sessionStudentId.split(',');
    return studentIds.map(id => getStudentName(id.trim()));
  };
  
  // Verifica se há uma sessão em um determinado horário e dia
  const getSessionAtTime = (dateStr: string, hour: number) => {
    return sessions.find(session => {
      const sessionDate = session.date;
      const sessionTimeMatch = sessionDate.match(/\d\d:\d\d/);
      
      let sessionHour = 0;
      if (sessionTimeMatch) {
        sessionHour = parseInt(sessionTimeMatch[0].split(':')[0]);
      } else if (sessionDate.includes('T')) {
        sessionHour = parseInt(sessionDate.split('T')[1]?.split(':')[0] || '0');
      } 
      
      return sessionDate.startsWith(dateStr) && sessionHour === hour;
    });
  };
  
  return (
    <div className="grid grid-cols-5 gap-1">
      {/* Header com os dias da semana */}
      {weekDays.map((day, index) => (
        <div key={`header-${index}`} className="text-center p-1 bg-indigo-100 rounded-t-lg font-medium sticky top-0 text-xs">
          <div className="capitalize">{day.dayName}</div>
          <div>{day.dayNumber}</div>
        </div>
      ))}
      
      {/* Blocos de hora */}
      {HOURS.map(hour => (
        <React.Fragment key={`hour-row-${hour}`}>
          {weekDays.map((day, dayIndex) => {
            const session = getSessionAtTime(day.dateStr, hour);
            
            return (
              <div 
                key={`${day.dateStr}-${hour}`} 
                className={`border border-gray-200 min-h-[35px] ${
                  session ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50 cursor-pointer'
                }`}
                onClick={() => {
                  if (!session) {
                    onAddSession(day.date, hour);
                  }
                }}
              >
                <div className="text-[10px] text-gray-500 border-b border-gray-100 px-1">
                  {hour}:00
                </div>
                
                {session && (
                  <div className="p-1">
                    <div className="font-medium text-[10px] text-indigo-800 truncate">
                      {session.type === 'individual' 
                        ? getStudentName(session.student_id)
                        : getSessionStudents(session.student_id).join(', ')
                      }
                    </div>
                    <div className="flex items-center text-[10px] text-gray-600">
                      <Clock size={8} className="mr-1" />
                      <span>{session.duration}h</span>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-600">
                      {session.type === 'individual' ? (
                        <User size={8} className="mr-1" />
                      ) : (
                        <Users size={8} className="mr-1" />
                      )}
                      <span className="truncate">{session.type === 'individual' ? 'Individual' : 'Coletiva'}</span>
                    </div>
                    {session.notes && (
                      <div className="text-[10px] text-gray-500 truncate">
                        {session.notes}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 text-red-500 hover:text-red-700 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                    >
                      <Trash2 size={8} />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
