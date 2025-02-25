
import { motion } from 'framer-motion';
import { Plus, Trash2, User, Users } from 'lucide-react';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ClassSessionForm } from './ClassSessionForm';
import { Student, ClassSession } from '@/types';

interface StudentListProps {
  students: Student[];
  classSessions: ClassSession[];
  currentMonth: string;
  onRemoveStudent: (id: string) => Promise<void>;
  onAddClass: (studentId: string, sessionData: Partial<ClassSession>) => Promise<void>;
}

export const StudentList = ({
  students,
  classSessions,
  currentMonth,
  onRemoveStudent,
  onAddClass,
}: StudentListProps) => {
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="Adicionar aula"
                      >
                        <Plus size={18} />
                      </button>
                    </DialogTrigger>
                    <ClassSessionForm
                      onSubmit={(sessionData) => onAddClass(student.id, sessionData)}
                      onClose={() => {}}
                    />
                  </Dialog>
                  <button
                    onClick={() => onRemoveStudent(student.id)}
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
  );
};
