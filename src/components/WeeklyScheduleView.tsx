
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
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  sessions,
  students,
  weekStart,
  onDeleteSession
}) => {
  // Criar um array com os dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => {
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
  
  return (
    <div className="grid grid-cols-7 gap-3">
      {weekDays.map((day, index) => (
        <div key={index} className="min-h-[200px]">
          <div className={`text-center p-2 rounded-t-lg font-medium ${day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-gray-100' : 'bg-indigo-100'}`}>
            <div className="capitalize">{day.dayName}</div>
            <div className="text-lg">{day.dayNumber}</div>
          </div>
          
          <div className="border border-gray-200 rounded-b-lg p-2 min-h-[150px] bg-white">
            {sessions
              .filter(session => session.date === day.dateStr)
              .map(session => (
                <div key={session.id} className="mb-2 p-2 bg-indigo-50 rounded-md shadow-sm">
                  <div className="font-medium text-indigo-800">
                    {getStudentName(session.student_id)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={14} className="mr-1" />
                    <span>Duração: {session.duration}h</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    {session.type === 'individual' ? (
                      <User size={14} className="mr-1" />
                    ) : (
                      <Users size={14} className="mr-1" />
                    )}
                    <span>{session.type === 'individual' ? 'Individual' : 'Coletiva'}</span>
                  </div>
                  {session.notes && (
                    <div className="text-xs text-gray-500 mt-1">
                      {session.notes}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 text-red-500 hover:text-red-700 p-0"
                    onClick={() => onDeleteSession(session.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
