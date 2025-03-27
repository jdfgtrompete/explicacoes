
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { AddScheduleEntryDialog } from '@/components/AddScheduleEntryDialog';
import { ScheduleHeader } from '@/components/schedule/ScheduleHeader';
import { WeekNavigation } from '@/components/schedule/WeekNavigation';
import { ScheduleContent } from '@/components/schedule/ScheduleContent';
import { AuthErrorDisplay } from '@/components/schedule/AuthErrorDisplay';
import { ErrorDisplay } from '@/components/schedule/ErrorDisplay';
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
    console.log("Opening dialog for day:", day, "hour:", hour);
    setSelectedDate(day);
    setSelectedHour(hour);
    setIsAddDialogOpen(true);
  };
  
  const handleRetry = () => {
    fetchSessions();
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
    return <AuthErrorDisplay onLogin={() => navigate('/auth')} />;
  }
  
  return (
    <div className="container mx-auto py-3 px-2">
      <ScheduleHeader title="Agenda Semanal" />
      
      {error ? (
        <ErrorDisplay error={error} onRetry={handleRetry} />
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
