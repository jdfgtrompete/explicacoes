
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Plus, CalendarClock, AlertCircle } from 'lucide-react';
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
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Segunda-feira
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Domingo
  
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
      
      // Buscar os alunos
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id);
      
      if (studentsError) {
        console.error('Erro ao buscar alunos:', studentsError);
        throw studentsError;
      }
      
      setStudents(studentsData || []);
      
      // Buscar as sessões da semana atual
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr);
      
      if (sessionsError) {
        console.error('Erro ao buscar sessões:', sessionsError);
        throw sessionsError;
      }
      
      // Garantir que o campo 'type' seja sempre 'individual' ou 'group'
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
      
      const { data, error } = await supabase
        .from('class_sessions')
        .insert({
          student_id: sessionData.studentId,
          user_id: user.id,
          date: format(sessionData.date, 'yyyy-MM-dd'),
          duration: sessionData.duration,
          type: sessionData.type,
          notes: sessionData.notes || null
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newSession: ClassSession = {
          ...data[0],
          type: data[0].type === 'group' ? 'group' : 'individual'
        };
        
        setSessions(prev => [...prev, newSession]);
      }
      
      toast.success('Aula adicionada com sucesso!');
      setIsAddDialogOpen(false);
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
  
  // Caso não esteja autenticado, redirecionar para página de login
  if (!user && !loading) {
    return (
      <div className="container mx-auto py-8 px-4">
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-800 flex items-center">
          <CalendarClock className="mr-2" />
          Agenda Semanal
        </h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Voltar ao início
        </Button>
      </div>
      
      {error ? (
        <Alert variant="destructive" className="mb-4">
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={handlePreviousWeek} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <ChevronLeft className="mr-1" size={16} />
              Semana Anterior
            </Button>
            
            <h2 className="text-lg font-medium text-indigo-700">
              {formattedDateRange}
            </h2>
            
            <Button 
              onClick={handleNextWeek} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              Próxima Semana
              <ChevronRight className="ml-1" size={16} />
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="mb-4 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Adicionar Aula
          </Button>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <WeeklyScheduleView 
              sessions={sessions} 
              students={students}
              weekStart={weekStart}
              onDeleteSession={handleDeleteSession}
            />
          )}
        </div>
      )}
      
      <AddScheduleEntryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        students={students}
        onAddSession={handleAddSession}
      />
    </div>
  );
};

export default WeeklySchedule;
