
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CalendarClock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useClassSessions } from '@/hooks/useClassSessions';
import { Header } from '@/components/Header';
import { HorarioGrid } from '@/components/horario/HorarioGrid';

const Horarios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const formattedWeekStart = format(weekStart, "d 'de' MMMM", { locale: ptBR });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const formattedWeekEnd = format(weekEnd, "d 'de' MMMM", { locale: ptBR });
  
  const { students, loading: studentsLoading } = useStudents(user?.id);
  
  const { 
    sessions, 
    loading: sessionsLoading, 
    fetchSessions,
    addSession,
    deleteSession
  } = useClassSessions(user?.id, currentWeek);
  
  const loading = studentsLoading || sessionsLoading;
  
  useEffect(() => {
    console.log("Current sessions:", sessions);
  }, [sessions]);
  
  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const handleRefresh = () => {
    toast.success("A atualizar dados...");
    fetchSessions();
  };
  
  if (!user && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">Você precisa estar autenticado para acessar esta página</p>
        <Button 
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Fazer login
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-900 mb-4 md:mb-0">Horários</h1>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Atualizar
            </Button>
          </div>
        </div>
        
        {/* Week navigation */}
        <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg shadow-sm">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft size={16} />
            Semana Anterior
          </Button>
          
          <h2 className="text-sm md:text-base font-medium text-indigo-800">
            <span className="hidden md:inline">Semana de </span>
            {formattedWeekStart} até {formattedWeekEnd}
          </h2>
          
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            Próxima Semana
            <ChevronRight size={16} />
          </Button>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-lg shadow p-4">
          {loading ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-indigo-500">Carregando horários...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarClock size={40} className="mx-auto mb-4 text-indigo-300" />
              <p className="mb-2 text-indigo-800">Adicione alunos antes de criar horários</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
              >
                Adicionar Alunos
              </Button>
            </div>
          ) : (
            <HorarioGrid 
              weekStart={weekStart}
              sessions={sessions}
              students={students}
              onAddSession={addSession}
              onDeleteSession={deleteSession}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Horarios;
