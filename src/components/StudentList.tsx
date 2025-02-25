
import { motion } from 'framer-motion';
import { Plus, Trash2, User, Users, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ClassSessionForm } from './ClassSessionForm';
import { Student, ClassSession } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});

  const toggleStudent = (studentId: string) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const getStudentClasses = (studentId: string, type: 'individual' | 'group') => {
    const monthStart = new Date(currentMonth + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    return classSessions
      .filter(session => 
        session.student_id === studentId &&
        session.type === type &&
        new Date(session.date) >= monthStart &&
        new Date(session.date) <= monthEnd
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const calculateMonthlyTotal = (studentId: string, type: 'individual' | 'group') => {
    const sessions = getStudentClasses(studentId, type);
    return sessions.reduce((total, session) => total + Number(session.duration), 0);
  };

  const calculateStudentTotal = (studentId: string) => {
    const individualHours = calculateMonthlyTotal(studentId, 'individual');
    const groupHours = calculateMonthlyTotal(studentId, 'group');
    const individualSessions = getStudentClasses(studentId, 'individual');
    const groupSessions = getStudentClasses(studentId, 'group');

    const individualTotal = individualSessions.reduce((total, session) => {
      const rate = Number(session.rate) || 14; // Taxa padrão se não especificada
      return total + (Number(session.duration) * rate);
    }, 0);

    const groupTotal = groupSessions.reduce((total, session) => {
      const rate = Number(session.rate) || 10; // Taxa padrão se não especificada
      return total + (Number(session.duration) * rate);
    }, 0);

    return individualTotal + groupTotal;
  };

  const calculateGrandTotal = () => {
    return students.reduce((total, student) => total + calculateStudentTotal(student.id), 0);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-50">
              <th className="px-6 py-4 text-left text-sm font-medium text-indigo-900">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-indigo-900">
                <div className="flex items-center gap-1">
                  <User size={16} /> Aulas Individuais
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-indigo-900">
                <div className="flex items-center gap-1">
                  <Users size={16} /> Aulas Coletivas
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
                className="border-t border-indigo-100 bg-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStudent(student.id)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {expandedStudents[student.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <span className="text-sm text-indigo-900 font-medium">{student.name}</span>
                  </div>
                  {expandedStudents[student.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-sm text-indigo-800 mb-1">Aulas Individuais:</div>
                        {getStudentClasses(student.id, 'individual').map((session) => (
                          <Tooltip key={session.id}>
                            <TooltipTrigger asChild>
                              <div className="text-sm text-gray-600 flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-1 rounded">
                                <Calendar size={14} />
                                {formatDate(session.date)} - {session.duration}h
                              </div>
                            </TooltipTrigger>
                            {session.notes && (
                              <TooltipContent>
                                <p className="max-w-xs">{session.notes}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                        <div className="font-medium text-sm text-indigo-800 mt-3 mb-1">Aulas Coletivas:</div>
                        {getStudentClasses(student.id, 'group').map((session) => (
                          <Tooltip key={session.id}>
                            <TooltipTrigger asChild>
                              <div className="text-sm text-gray-600 flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-1 rounded">
                                <Calendar size={14} />
                                {formatDate(session.date)} - {session.duration}h
                              </div>
                            </TooltipTrigger>
                            {session.notes && (
                              <TooltipContent>
                                <p className="max-w-xs">{session.notes}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-indigo-600">
                    Total: {calculateMonthlyTotal(student.id, 'individual')}h
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-indigo-600">
                    Total: {calculateMonthlyTotal(student.id, 'group')}h
                  </div>
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
    </TooltipProvider>
  );
};
