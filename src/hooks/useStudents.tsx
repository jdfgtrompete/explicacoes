
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types';
import { toast } from 'sonner';

export const useStudents = (userId: string | undefined) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!userId) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }
      
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId);
      
      if (studentsError) {
        console.error('Erro ao buscar alunos:', studentsError);
        throw studentsError;
      }
      
      console.log("Fetched students:", studentsData);
      setStudents(studentsData || []);
    } catch (error: any) {
      console.error('Erro ao buscar alunos:', error);
      setError(error.message || "Erro de conexão com o servidor");
      toast.error('Erro ao carregar dados dos alunos');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [userId]);
  
  return {
    students,
    loading,
    error,
    fetchStudents
  };
};
