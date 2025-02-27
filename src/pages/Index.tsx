
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Student, WeeklyRecord } from '@/types';
import { Header } from '@/components/Header';
import { AddStudentForm } from '@/components/AddStudentForm';
import { AddWeekButton } from '@/components/AddWeekButton';
import { StudentList } from '@/components/StudentList';
import { TotalDisplay } from '@/components/TotalDisplay';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyRecord[]>([]);
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
        .eq('year', parseInt(year));

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

  const handleAddStudent = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{ 
          name: name.trim(),
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setStudents([...students, data]);
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
      record => record.month === month && record.year === parseInt(year)
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
        year: parseInt(year),
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
          record.year === parseInt(year)
      );

      const newRecord = {
        student_id: studentId,
        user_id: user?.id,
        week_number: weekNumber,
        month,
        year: parseInt(year),
        individual_classes: type === 'individual' ? value : existingRecord?.individual_classes || 0,
        group_classes: type === 'group' ? value : existingRecord?.group_classes || 0,
        individual_rate: existingRecord?.individual_rate || 14,
        group_rate: existingRecord?.group_rate || 10
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
        description: "Horas atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating classes:', error);
      toast({
        title: "Erro ao atualizar horas",
        description: "Não foi possível atualizar as horas. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const updateRates = async (
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
          record.year === parseInt(year)
      );

      if (!existingRecord) return;

      const newRecord = {
        ...existingRecord,
        individual_rate: type === 'individual' ? value : existingRecord.individual_rate,
        group_rate: type === 'group' ? value : existingRecord.group_rate
      };

      const { error } = await supabase
        .from('weekly_records')
        .update(newRecord)
        .eq('id', existingRecord.id);

      if (error) throw error;

      setWeeklyRecords(weeklyRecords.map(record =>
        record.id === existingRecord.id ? { ...record, ...newRecord } : record
      ));

      toast({
        title: "Sucesso!",
        description: "Preço por hora atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating rates:', error);
      toast({
        title: "Erro ao atualizar preço por hora",
        description: "Não foi possível atualizar o preço por hora. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStudentWeeks = (studentId: string) => {
    const [year, month] = currentMonth.split('-');
    return weeklyRecords.filter(
      record => 
        record.student_id === studentId &&
        record.month === month &&
        record.year === parseInt(year)
    ).sort((a, b) => a.week_number - b.week_number);
  };

  const calculateMonthlyTotal = (studentId: string) => {
    const [year, month] = currentMonth.split('-');
    const studentRecords = weeklyRecords.filter(
      record => 
        record.student_id === studentId &&
        record.month === month &&
        record.year === parseInt(year)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <Header 
          email={user?.email}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          handleLogout={handleLogout}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-indigo-100 bg-white/50">
            <div className="flex gap-4 items-center justify-between">
              <AddStudentForm onAddStudent={handleAddStudent} />
              <AddWeekButton onAddWeek={handleAddWeek} disabled={students.length === 0} />
            </div>
          </div>

          <StudentList 
            students={students}
            weeklyRecords={weeklyRecords}
            currentMonth={currentMonth}
            onRemoveStudent={handleRemoveStudent}
            onUpdateClasses={updateWeeklyClasses}
            onUpdateRates={updateRates}
            calculateMonthlyTotal={calculateMonthlyTotal}
            getStudentWeeks={getStudentWeeks}
          />

          {students.length > 0 && (
            <TotalDisplay total={calculateGrandTotal()} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
