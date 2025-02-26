import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, User, CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Student, WeeklyRecord } from '@/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyRecord[]>([]);
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

      const [year, month] = currentMonth.split('-');
      const { data: recordsData, error: recordsError } = await supabase
        .from('weekly_records')
        .select('*')
        .eq('user_id', user?.id)
        .eq('month', month)
        .eq('year', year);

      if (recordsError) throw recordsError;

      setStudents(studentsData || []);
      setWeeklyRecords(recordsData || []);
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
  }, [currentMonth]);

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
      setWeeklyRecords(weeklyRecords.filter(record => record.student_id !== id));
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

  const getNextWeekNumber = () => {
    const [year, month] = currentMonth.split('-');
    const records = weeklyRecords.filter(
      record => record.month === month && record.year === Number(year)
    );
    
    if (records.length === 0) return 1;
    
    const maxWeek = Math.max(...records.map(record => record.week_number));
    return maxWeek + 1;
  };

  const handleAddWeek = async () => {
    const [year, month] = currentMonth.split('-');
    const nextWeek = getNextWeekNumber();
    
    try {
      const newRecords = students.map(student => ({
        student_id: student.id,
        user_id: user?.id,
        week_number: nextWeek,
        month,
        year: Number(year),
        individual_classes: 0,
        group_classes: 0,
        individual_rate: 14,
        group_rate: 10
      }));

      const { data, error } = await supabase
        .from('weekly_records')
        .insert(newRecords)
        .select();

      if (error) throw error;

      setWeeklyRecords([...weeklyRecords, ...data]);
      toast({
        title: "Sucesso!",
        description: `Semana ${nextWeek} adicionada para todos os alunos.`,
      });
    } catch (error) {
      console.error('Error adding week:', error);
      toast({
        title: "Erro ao adicionar semana",
        description: "Não foi possível adicionar a semana. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getWeeksInMonth = () => {
    const date = new Date(currentMonth + '-01');
    const startWeek = getWeek(startOfMonth(date));
    const weeksInMonth = [startWeek];
    
    let currentDate = new Date(date);
    while (currentDate.getMonth() === date.getMonth()) {
      const week = getWeek(currentDate);
      if (!weeksInMonth.includes(week)) {
        weeksInMonth.push(week);
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return weeksInMonth.sort((a, b) => a - b);
  };

  const updateWeeklyClasses = async (
    studentId: string,
    weekNumber: number,
    type: 'individual' | 'group',
    value: number
  ) => {
    const [year, month] = currentMonth.split('-');
    
    try {
      const existingRecord = weeklyRecords.find(
        record => 
          record.student_id === studentId && 
          record.week_number === weekNumber &&
          record.month === month &&
          record.year === Number(year)
      );

      const newRecord = {
        student_id: studentId,
        user_id: user?.id,
        week_number: weekNumber,
        month,
        year: Number(year),
        individual_classes: type === 'individual' ? value : existingRecord?.individual_classes || 0,
        group_classes: type === 'group' ? value : existingRecord?.group_classes || 0,
        individual_rate: 14,
        group_rate: 10
      };

      if (existingRecord) {
        const { error } = await supabase
          .from('weekly_records')
          .update(newRecord)
          .eq('id', existingRecord.id);

        if (error) throw error;

        setWeeklyRecords(weeklyRecords.map(record =>
          record.id === existingRecord.id ? { ...record, ...newRecord } : record
        ));
      } else {
        const { data, error } = await supabase
          .from('weekly_records')
          .insert([newRecord])
          .select()
          .single();

        if (error) throw error;

        setWeeklyRecords([...weeklyRecords, data]);
      }

      toast({
        title: "Sucesso!",
        description: "Aulas atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating classes:', error);
      toast({
        title: "Erro ao atualizar aulas",
        description: "Não foi possível atualizar as aulas. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getWeeklyRecord = (studentId: string, weekNumber: number) => {
    const [year, month] = currentMonth.split('-');
    return weeklyRecords.find(
      record => 
        record.student_id === studentId && 
        record.week_number === weekNumber &&
        record.month === month &&
        record.year === Number(year)
    ) || {
      student_id: studentId,
      week_number: weekNumber,
      month,
      year: Number(year),
      individual_classes: 0,
      group_classes: 0,
      individual_rate: 14,
      group_rate: 10
    };
  };

  const calculateMonthlyTotal = (studentId: string) => {
    const [year, month] = currentMonth.split('-');
    const studentRecords = weeklyRecords.filter(
      record => 
        record.student_id === studentId &&
        record.month === month &&
        record.year === Number(year)
    );

    const total = studentRecords.reduce((acc, record) => {
      const individualTotal = record.individual_classes * record.individual_rate;
      const groupTotal = record.group_classes * record.group_rate;
      return acc + individualTotal + groupTotal;
    }, 0);

    return total;
  };

  const calculateGrandTotal = () => {
    return students.reduce((total, student) => total + calculateMonthlyTotal(student.id), 0);
  };

  const getStudentWeeks = (studentId: string) => {
    const [year, month] = currentMonth.split('-');
    return weeklyRecords.filter(
      record => 
        record.student_id === studentId &&
        record.month === month &&
        record.year === Number(year)
    ).sort((a, b) => a.week_number - b.week_number);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
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
            <div className="flex gap-4 items-center justify-between">
              <div className="flex gap-4 flex-1">
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
                  Adicionar Aluno
                </button>
              </div>
              <button
                onClick={handleAddWeek}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                disabled={students.length === 0}
              >
                <Plus size={18} />
                Adicionar Nova Semana
              </button>
            </div>
          </div>

          <div className="divide-y divide-indigo-100">
            {students.map((student) => (
              <Collapsible key={student.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:text-indigo-600">
                      <ChevronDown className="h-4 w-4" />
                      <span className="font-medium">{student.name}</span>
                    </CollapsibleTrigger>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-indigo-900">
                      Total: {calculateMonthlyTotal(student.id).toFixed(2)}€
                    </span>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remover aluno"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="mt-4 space-y-4">
                    {getStudentWeeks(student.id).map((record) => {
                      const weekTotal = 
                        (record.individual_classes * record.individual_rate) +
                        (record.group_classes * record.group_rate);

                      return (
                        <div key={record.id} className="bg-indigo-50/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-indigo-900">Semana {record.week_number}</h3>
                            <span className="text-sm font-medium text-indigo-600">
                              Total da semana: {weekTotal.toFixed(2)}€
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-indigo-700 mb-1">
                                <User size={14} className="inline mr-1" />
                                Aulas Individuais
                              </label>
                              <input
                                type="number"
                                value={record.individual_classes || ''}
                                onChange={(e) => updateWeeklyClasses(
                                  student.id,
                                  record.week_number,
                                  'individual',
                                  Number(e.target.value)
                                )}
                                className="w-24 px-3 py-1 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-indigo-700 mb-1">
                                <Users size={14} className="inline mr-1" />
                                Aulas Coletivas
                              </label>
                              <input
                                type="number"
                                value={record.group_classes || ''}
                                onChange={(e) => updateWeeklyClasses(
                                  student.id,
                                  record.week_number,
                                  'group',
                                  Number(e.target.value)
                                )}
                                className="w-24 px-3 py-1 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {students.length > 0 && (
            <div className="border-t border-indigo-100 bg-indigo-50 p-4">
              <div className="flex justify-end items-center">
                <span className="text-lg font-medium text-indigo-900">
                  Total do Mês: {calculateGrandTotal().toFixed(2)}€
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
