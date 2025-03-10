
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { AddScheduleEntryDialog } from '@/components/AddScheduleEntryDialog';
import { ScheduleHeader } from '@/components/schedule/ScheduleHeader';
import { WeekNavigation } from '@/components/schedule/WeekNavigation';
import { ScheduleContent } from '@/components/schedule/ScheduleContent';
import { useClassSessions } from '@/hooks/useClassSessions';
import { useStudents } from '@/hooks/useStudents';

const WeeklySchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined);
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const { students, loading: studentsLoading, error: studentsError } = useStudents(user?.id);
  
  const { 
    sessions, 
    loading: sessionsLoading, 
    error: sessionsError, 
    fetchSessions,
    addSession,
    deleteSession
  } = useClassSessions(user?.id, currentWeek);
  
  const loading = studentsLoading || sessionsLoading;
  const error = studentsError || sessionsError;
  
  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const handleOpenAddDialog = (day: Date, hour: number) => {
    setSelectedDate(day);
    setSelectedHour(hour);
    setIsAddDialogOpen(true);
  };
  
  const handleAddSession = async (sessionData: {
    studentId: string;
    date: Date;
    duration: number;
    type: 'individual' | 'group';
    notes: string;
  }) => {
    const success = await addSession(sessionData);
    if (success) {
      setIsAddDialogOpen(false);
    }
  };

  const handleDefaultAddSession = () => {
    const now = new Date();
    handleOpenAddDialog(now, now.getHours());
  };
  
  if (!user && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">Você precisa estar autenticado para acessar esta página</p>
        <button 
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Fazer login
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-3 px-2">
      <ScheduleHeader title="Agenda Semanal" onRefresh={fetchSessions} />
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <h3 className="text-red-800 font-medium mb-2">Erro ao carregar dados</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={fetchSessions}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-3">
          <WeekNavigation 
            currentWeek={currentWeek}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
          />
          
          <ScheduleContent 
            loading={loading}
            sessions={sessions}
            students={students}
            weekStart={weekStart}
            onDeleteSession={deleteSession}
            onAddSession={handleOpenAddDialog}
            onOpenAddDialog={handleDefaultAddSession}
            navigate={navigate}
          />
        </div>
      )}
      
      <AddScheduleEntryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        students={students}
        onAddSession={handleAddSession}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
      />
    </div>
  );
};

export default WeeklySchedule;
