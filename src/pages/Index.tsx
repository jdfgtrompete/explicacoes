
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, User, CalendarIcon, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: string;
  name: string;
  user_id: string;
}

interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes?: string;
}

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
  
  // Nova aula
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classDuration, setClassDuration] = useState('');
  const [classType, setClassType] = useState<'individual' | 'group'>('individual');
  const [classNotes, setClassNotes] = useState('');

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
      setClassSessions(sessionsData || []);
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

  const handleAddClass = async () => {
    if (!selectedStudent || !classDate || !classDuration) {
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
          student_id: selectedStudent,
          date: classDate,
          duration: Number(classDuration),
          type: classType,
          notes: classNotes,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setClassSessions([...classSessions, data]);
      setIsAddingClass(false);
      resetClassForm();
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

  const resetClassForm = () => {
    setSelectedStudent('');
    setClassDate('');
    setClassDuration('');
    setClassType('individual');
    setClassNotes('');
  };

  const calculateMonthlyTotal = (studentId: string, type: 'individual' | 'group') => {
    const monthStart = new Date(currentMonth + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    return classSessions
      .filter(session => 
        session.student_id === studentId &&
        session.type === type &&
        new Date(session.date) >= monthStart &&
        new Date(session.date) <= monthEnd
      )
      .reduce((total, session) => total + Number(session.duration), 0);
  };

  const calculateStudentTotal = (studentId: string) => {
    const individualRate = 14;
    const groupRate = 10;
    
    const individualHours = calculateMonthlyTotal(studentId, 'individual');
    const groupHours = calculateMonthlyTotal(studentId, 'group');

    return (individualHours * individualRate) + (groupHours * groupRate);
  };

  const calculateGrandTotal = () => {
    return students.reduce((total, student) => total + calculateStudentTotal(student.id), 0);
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
              <input
                type="text"
                placeholder="Nome do Aluno"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-indigo-900">Nome</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-indigo-900">
                    <div className="flex items-center justify-center gap-1">
                      <User size={16} /> Horas Individuais
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-indigo-900">
                    <div className="flex items-center justify-center gap-1">
                      <Users size={16} /> Horas Coletivas
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-indigo-900">Total</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-indigo-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <motion.tr 
                    key={student.id} 
                    className="border-t border-indigo-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 text-sm text-indigo-900">{student.name}</td>
                    <td className="px-6 py-4 text-center">
                      {calculateMonthlyTotal(student.id, 'individual')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {calculateMonthlyTotal(student.id, 'group')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-indigo-900">
                      {calculateStudentTotal(student.id).toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Dialog open={isAddingClass} onOpenChange={setIsAddingClass}>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => {
                                setSelectedStudent(student.id);
                                setIsAddingClass(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors"
                              title="Adicionar aula"
                            >
                              <Plus size={18} />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Registrar Nova Aula</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <label>Data da Aula</label>
                                <Input
                                  type="date"
                                  value={classDate}
                                  onChange={(e) => setClassDate(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <label>Duração (horas)</label>
                                <Input
                                  type="number"
                                  step="0.5"
                                  min="0.5"
                                  value={classDuration}
                                  onChange={(e) => setClassDuration(e.target.value)}
                                  placeholder="Ex: 1.5"
                                />
                              </div>
                              <div className="grid gap-2">
                                <label>Tipo de Aula</label>
                                <Select value={classType} onValueChange={(value: 'individual' | 'group') => setClassType(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="group">Coletiva</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <label>Notas (opcional)</label>
                                <Textarea
                                  value={classNotes}
                                  onChange={(e) => setClassNotes(e.target.value)}
                                  placeholder="Adicione notas sobre a aula..."
                                />
                              </div>
                              <button
                                onClick={handleAddClass}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                Registrar Aula
                              </button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remover aluno"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {students.length > 0 && (
                  <motion.tr 
                    className="border-t border-indigo-100 bg-indigo-50 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <td colSpan={3} className="px-6 py-4 text-right text-indigo-900">
                      Total do Mês:
                    </td>
                    <td className="px-6 py-4 text-right text-indigo-900 font-bold">
                      {calculateGrandTotal().toFixed(2)}€
                    </td>
                    <td></td>
                  </motion.tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
