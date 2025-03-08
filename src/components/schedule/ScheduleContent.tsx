
import React from 'react';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student } from '@/types';
import { WeeklyScheduleView } from '@/components/schedule/WeeklyScheduleView';

interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes: string | null;
}

interface ScheduleContentProps {
  loading: boolean;
  sessions: ClassSession[];
  students: Student[];
  weekStart: Date;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onAddSession: (day: Date, hour: number) => void;
  onOpenAddDialog: () => void;
  navigate: (path: string) => void;
}

export const ScheduleContent: React.FC<ScheduleContentProps> = ({
  loading,
  sessions,
  students,
  weekStart,
  onDeleteSession,
  onAddSession,
  onOpenAddDialog,
  navigate
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-indigo-400">
        <CalendarClock size={40} className="mx-auto mb-2 opacity-50" />
        <p>Primeiro adicione alunos antes de agendar aulas</p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2"
          onClick={() => navigate('/')}
        >
          Adicionar alunos
        </Button>
      </div>
    );
  }
  
  if (sessions.length === 0) {
    return (
      <div className="text-center py-10 text-indigo-400">
        <CalendarClock size={40} className="mx-auto mb-2 opacity-50" />
        <p>Nenhuma aula agendada para esta semana</p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2"
          onClick={onOpenAddDialog}
        >
          Adicionar aula
        </Button>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-200px)] overflow-auto">
      <WeeklyScheduleView 
        sessions={sessions} 
        students={students}
        weekStart={weekStart}
        onDeleteSession={onDeleteSession}
        onAddSession={onAddSession}
      />
    </div>
  );
};
