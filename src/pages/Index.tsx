
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, User, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Student {
  id: string;
  name: string;
}

interface MonthlyRecord {
  studentId: string;
  individualClasses: number;
  groupClasses: number;
  month: string; // formato: 'YYYY-MM'
}

const Index = () => {
  // Estado global de alunos
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para registros mensais
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>(() => {
    const saved = localStorage.getItem('monthlyRecords');
    return saved ? JSON.parse(saved) : [];
  });

  // Estados para valores das aulas
  const [individualRate, setIndividualRate] = useState<number>(14);
  const [groupRate, setGroupRate] = useState<number>(10);

  // Estado para novo aluno
  const [newStudentName, setNewStudentName] = useState('');

  // Estado para o mês atual
  const [currentMonth, setCurrentMonth] = useState(() => {
    return format(new Date(), 'yyyy-MM');
  });

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('monthlyRecords', JSON.stringify(monthlyRecords));
  }, [monthlyRecords]);

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      const newStudent = {
        id: Date.now().toString(),
        name: newStudentName.trim()
      };
      setStudents([...students, newStudent]);
      setNewStudentName('');
    }
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
    setMonthlyRecords(monthlyRecords.filter(record => record.studentId !== id));
  };

  const getStudentRecord = (studentId: string): MonthlyRecord => {
    return (
      monthlyRecords.find(
        record => record.studentId === studentId && record.month === currentMonth
      ) || {
        studentId,
        individualClasses: 0,
        groupClasses: 0,
        month: currentMonth
      }
    );
  };

  const updateClasses = (studentId: string, type: 'individual' | 'group', value: number) => {
    const newRecords = [...monthlyRecords];
    const existingRecordIndex = monthlyRecords.findIndex(
      record => record.studentId === studentId && record.month === currentMonth
    );

    const newRecord = {
      studentId,
      individualClasses: type === 'individual' ? value : getStudentRecord(studentId).individualClasses,
      groupClasses: type === 'group' ? value : getStudentRecord(studentId).groupClasses,
      month: currentMonth
    };

    if (existingRecordIndex >= 0) {
      newRecords[existingRecordIndex] = newRecord;
    } else {
      newRecords.push(newRecord);
    }

    setMonthlyRecords(newRecords);
  };

  const calculateTotal = (studentId: string) => {
    const record = getStudentRecord(studentId);
    return (record.individualClasses * individualRate) + (record.groupClasses * groupRate);
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
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
                          value={record.individualClasses || ''}
                          onChange={(e) => updateClasses(student.id, 'individual', Number(e.target.value))}
                          className="w-20 px-2 py-1 text-right border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={record.groupClasses || ''}
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
