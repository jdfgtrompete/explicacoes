
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, CalendarClock, AlertCircle } from 'lucide-react';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { WeeklyScheduleView } from '@/components/WeeklyScheduleView';
import { AddScheduleEntryDialog } from '@/components/AddScheduleEntryDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes: string | null;
  created_at?: string;
  user_id?: string;
}

const WeeklySchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined);
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const formattedDateRange = `${format(weekStart, 'd', { locale: ptBR })} - ${format(weekEnd, 'd \'de\' MMMM, yyyy', { locale: ptBR })}`;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }
      
      // Fetch students first
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id);
      
      if (studentsError) {
        console.error('Erro ao buscar alunos:', studentsError);
        throw studentsError;
      }
      
      console.log("Fetched students:", studentsData);
      setStudents(studentsData || []);
      
      // Then fetch sessions for the current week
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
      
      console.log("Fetching sessions from", weekStartStr, "to", weekEndStr);
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr + 'T23:59:59');
      
      if (sessionsError) {
        console.error('Erro ao buscar sessões:', sessionsError);
        throw sessionsError;
      }
      
      console.log("Fetched sessions:", sessionsData);
      
      const typedSessions = (sessionsData || []).map(session => ({
        ...session,
        type: session.type === 'group' ? 'group' : 'individual'
      })) as ClassSession[];
      
      setSessions(typedSessions);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message || "Erro de conexão com o servidor");
      toast.error('Erro ao carregar dados da agenda');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, currentWeek]);
  
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
  
  const handleAddSession = async (sessionData: {
    studentId: string;
    date: Date;
    duration: number;
    type: 'individual' | 'group';
    notes: string;
  }) => {
    try {
      if (!user) {
        toast.error('Você precisa estar autenticado para adicionar aulas');
        return;
      }
      
      console.log("Adding session with full data:", sessionData);
      
      const dateWithTime = format(sessionData.date, "yyyy-MM-dd'T'HH:mm:ss");
      console.log("Adding session with date:", dateWithTime);
      console.log("Adding session for student:", sessionData.studentId);
      
      const { data, error } = await supabase
        .from('class_sessions')
        .insert({
          student_id: sessionData.studentId,
          user_id: user.id,
          date: dateWithTime,
          duration: sessionData.duration,
          type: sessionData.type,
          notes: sessionData.notes || null
        })
        .select();
      
      if (error) {
        console.error("Error creating session:", error);
        throw error;
      }
      
      console.log("Created session:", data);
      
      if (data && data[0]) {
        const newSession: ClassSession = {
          ...data[0],
          type: data[0].type === 'group' ? 'group' : 'individual'
        };
        
        setSessions(prev => [...prev, newSession]);
      }
      
      toast.success('Aula adicionada com sucesso!');
      setIsAddDialogOpen(false);
      
      // Refresh data to ensure everything is up-to-date
      fetchData();
    } catch (error: any) {
      console.error('Erro ao adicionar aula:', error);
      toast.error(`Erro ao adicionar aula: ${error.message || 'Falha na conexão'}`);
    }
  };
  
  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('class_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Aula removida com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover aula:', error);
      toast.error(`Erro ao remover aula: ${error.message || 'Falha na conexão'}`);
    }
  };
  
  const handleRetry = () => {
    fetchData();
  };
  
  if (!user && !loading) {
    return (
      <div className="container mx-auto py-4 px-2">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso não autorizado</AlertTitle>
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
            <div className="mt-2">
              <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                Ir para login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-3 px-2">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-indigo-800 flex items-center">
          <CalendarClock className="mr-2" size={18} />
          Agenda Semanal
        </h1>
        <Button onClick={() => navigate('/')} variant="outline" size="sm">
          Voltar ao início
        </Button>
      </div>
      
      {error ? (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between mb-3 bg-blue-50 p-2 rounded-md">
            <Button 
              onClick={handlePreviousWeek} 
              variant="outline" 
              size="sm"
              className="flex items-center text-xs bg-white"
            >
              <ChevronLeft className="mr-1" size={14} />
              Anterior
            </Button>
            
            <h2 className="text-sm font-medium text-blue-800">
              {formattedDateRange}
            </h2>
            
            <Button 
              onClick={handleNextWeek} 
              variant="outline" 
              size="sm"
              className="flex items-center text-xs bg-white"
            >
              Próxima
              <ChevronRight className="ml-1" size={14} />
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : students.length === 0 ? (
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
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-indigo-400">
              <CalendarClock size={40} className="mx-auto mb-2 opacity-50" />
              <p>Nenhuma aula agendada para esta semana</p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2"
                onClick={() => {
                  const now = new Date();
                  handleOpenAddDialog(now, now.getHours());
                }}
              >
                Adicionar aula
              </Button>
            </div>
          ) : (
            <div className="h-[calc(100vh-200px)]">
              <WeeklyScheduleView 
                sessions={sessions} 
                students={students}
                weekStart={weekStart}
                onDeleteSession={handleDeleteSession}
                onAddSession={handleOpenAddDialog}
              />
            </div>
          )}
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
