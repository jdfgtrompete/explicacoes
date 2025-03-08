
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

export const useClassSessions = (userId: string | undefined, currentWeek: Date) => {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekStart = new Date(currentWeek);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
  
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!userId) {
        setError("Usuário não autenticado");
        setLoading(false);
        return { sessions: [] };
      }
      
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
      
      console.log("Fetching sessions from", weekStartStr, "to", weekEndStr);
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('user_id', userId)
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
      setLoading(false);
      return { sessions: typedSessions };
    } catch (error: any) {
      console.error('Erro ao buscar sessões:', error);
      setError(error.message || "Erro de conexão com o servidor");
      toast.error('Erro ao carregar dados da agenda');
      setLoading(false);
      return { sessions: [] };
    }
  };
  
  const addSession = async (sessionData: {
    studentId: string;
    date: Date;
    duration: number;
    type: 'individual' | 'group';
    notes: string;
  }) => {
    try {
      if (!userId) {
        toast.error('Você precisa estar autenticado para adicionar aulas');
        return false;
      }
      
      console.log("Adding session with full data:", sessionData);
      
      const dateWithTime = format(sessionData.date, "yyyy-MM-dd'T'HH:mm:ss");
      console.log("Adding session with date:", dateWithTime);
      console.log("Adding session for student:", sessionData.studentId);
      
      const { data, error } = await supabase
        .from('class_sessions')
        .insert({
          student_id: sessionData.studentId,
          user_id: userId,
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
        toast.success('Aula adicionada com sucesso!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erro ao adicionar aula:', error);
      toast.error(`Erro ao adicionar aula: ${error.message || 'Falha na conexão'}`);
      return false;
    }
  };
  
  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('class_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Aula removida com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao remover aula:', error);
      toast.error(`Erro ao remover aula: ${error.message || 'Falha na conexão'}`);
      return false;
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [userId, currentWeek]);
  
  return {
    sessions,
    loading,
    error,
    fetchSessions,
    addSession,
    deleteSession
  };
};
