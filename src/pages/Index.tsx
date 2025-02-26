import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, User, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface Student {
  id: string;
  name: string;
  user_id: string;
}

interface MonthlyRecord {
  id?: string;
  student_id: string;
  individual_classes: number;
  group_classes: number;
  month: string;
  user_id: string;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [individualRate, setIndividualRate] = useState<number>(14);
  const [groupRate, setGroupRate] = useState<number>(10);
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

      const { data: recordsData, error: recordsError } = await supabase
        .from('monthly_records')
        .select('*')
        .eq('user_id', user?.id);

      if (recordsError) throw recordsError;

      setStudents(studentsData || []);
      setMonthlyRecords(recordsData || []);
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
      setMonthlyRecords(monthlyRecords.filter(record => record.student_id !== id));
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

  const getStudentRecord = (studentId: string): MonthlyRecord => {
    return (
      monthlyRecords.find(
        record => record.student_id === studentId && record.month === currentMonth
      ) || {
        student_id: studentId,
        individual_classes: 0,
        group_classes: 0,
        month: currentMonth,
        user_id: user?.id
      }
    );
  };

  const updateClasses = async (studentId: string, type: 'individual' | 'group', value: number) => {
    try {
      const existingRecord = monthlyRecords.find(
        record => record.student_id === studentId && record.month === currentMonth
      );

      const newRecord = {
        student_id: studentId,
        individual_classes: type === 'individual' ? value : getStudentRecord(studentId).individual_classes,
        group_classes: type === 'group' ? value : getStudentRecord(studentId).group_classes,
        month: currentMonth,
        user_id: user?.id
      };

      if (existingRecord) {
        const { error } = await supabase
          .from('monthly_records')
          .update(newRecord)
          .eq('student_id', studentId)
          .eq('month', currentMonth);

        if (error) throw error;

        setMonthlyRecords(monthlyRecords.map(record =>
          record.student_id === studentId && record.month === currentMonth
            ? { ...record, ...newRecord }
            : record
        ));
      } else {
        const { data, error } = await supabase
          .from('monthly_records')
          .insert([newRecord])
          .select()
          .single();

        if (error) throw error;

        setMonthlyRecords([...monthlyRecords, data]);
      }
    } catch (error) {
      console.error('Error updating classes:', error);
      toast({
        title: "Erro ao atualizar aulas",
        description: "Não foi possível atualizar as aulas. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = (studentId: string) => {
    const record = getStudentRecord(studentId);
    return (record.individual_classes * individualRate) + (record.group_classes * groupRate);
  };

  const calculateGrandTotal = () => {
    return students.reduce((total, student) => total + calculateTotal(student.id), 0);
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-sm"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-indigo-700">
                Valor por Hora (Individual)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={individualRate}
                  onChange={(e) => setIndividualRate(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
                <span className="ml-2">€</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-indigo-700">
                Valor por Hora (Coletivas)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={groupRate}
                  onChange={(e) => setGroupRate(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
                <span className="ml-2">€</span>
              </div>
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
                      <User size={16} /> Aulas Individuais
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-indigo-900">
                    <div className="flex items-center justify-center gap-1">
                      <Users size={16} /> Aulas Coletivas
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-indigo-900">Total</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-indigo-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const record = getStudentRecord(student.id);
                  return (
                    <motion.tr 
                      key={student.id} 
                      className="border-t border-indigo-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 text-sm text-indigo-900">{student.name}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={record.individual_classes || ''}
                          onChange={(e) => updateClasses(student.id, 'individual', Number(e.target.value))}
                          className="w-20 px-2 py-1 text-right border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={record.group_classes || ''}
                          onChange={(e) => updateClasses(student.id, 'group', Number(e.target.value))}
                          className="w-20 px-2 py-1 text-right border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-indigo-900">
                        {calculateTotal(student.id).toFixed(2)}€
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
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
