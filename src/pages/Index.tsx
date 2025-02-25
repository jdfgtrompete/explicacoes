
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CalendarIcon, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { StudentList } from '@/components/StudentList';
import { Student, ClassSession } from '@/types';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => {
    return format(new Date(), 'yyyy-MM');
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchData = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user?.id);

      if (studentsError) throw studentsError;

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('user_id', user?.id);

      if (sessionsError) throw sessionsError;

      setStudents(studentsData || []);
      setClassSessions(sessionsData as ClassSession[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async () => {
    if (newStudentName.trim()) {
      try {
        const { data, error } = await supabase
          .from('students')
          .insert([{ 
            name: newStudentName.trim(),
            user_id: user?.id
          }])
          .select()
          .single();

        if (error) throw error;

        setStudents([...students, data]);
        setNewStudentName('');
        toast({
          title: "Sucesso!",
          description: "Aluno adicionado com sucesso.",
        });
      } catch (error) {
        console.error('Error adding student:', error);
        toast({
          title: "Erro ao adicionar aluno",
          description: "Não foi possível adicionar o aluno. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(students.filter(student => student.id !== id));
      setClassSessions(classSessions.filter(session => session.student_id !== id));
      toast({
        title: "Sucesso!",
        description: "Aluno removido com sucesso.",
      });
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: "Erro ao remover aluno",
        description: "Não foi possível remover o aluno. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddClass = async (studentId: string, sessionData: Partial<ClassSession>) => {
    if (!sessionData.date || !sessionData.duration) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('class_sessions')
        .insert([{
          student_id: studentId,
          date: sessionData.date,
          duration: sessionData.duration,
          type: sessionData.type || 'individual',
          notes: sessionData.notes,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setClassSessions([...classSessions, data as ClassSession]);
      toast({
        title: "Sucesso!",
        description: "Aula registrada com sucesso.",
      });
    } catch (error) {
      console.error('Error adding class:', error);
      toast({
        title: "Erro ao registrar aula",
        description: "Não foi possível registrar a aula. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 className="text-4xl font-light text-indigo-900 flex items-center gap-2">
              <CalendarIcon className="w-8 h-8" />
              Gestor de Explicações
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-indigo-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-indigo-100 bg-white/50">
            <div className="flex gap-4 items-center">
              <Input
                type="text"
                placeholder="Nome do Aluno"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
              <button
                onClick={handleAddStudent}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus size={18} />
                Adicionar
              </button>
            </div>
          </div>

          <StudentList
            students={students}
            classSessions={classSessions}
            currentMonth={currentMonth}
            onRemoveStudent={handleRemoveStudent}
            onAddClass={handleAddClass}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
