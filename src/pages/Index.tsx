
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, User } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  individualClasses: number;
  groupClasses: number;
}

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [hourRate, setHourRate] = useState(20); // Valor inicial por hora
  const [groupDiscount, setGroupDiscount] = useState(0.7); // Desconto inicial para aulas coletivas
  const [newStudent, setNewStudent] = useState<Student>({
    id: '',
    name: '',
    individualClasses: 0,
    groupClasses: 0
  });

  const handleAddStudent = () => {
    if (newStudent.name) {
      setStudents([...students, { ...newStudent, id: Date.now().toString() }]);
      setNewStudent({ id: '', name: '', individualClasses: 0, groupClasses: 0 });
    }
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const updateClasses = (id: string, type: 'individual' | 'group', value: number) => {
    setStudents(students.map(student => 
      student.id === id 
        ? { 
            ...student, 
            [type === 'individual' ? 'individualClasses' : 'groupClasses']: value 
          } 
        : student
    ));
  };

  const calculateTotal = (student: Student) => {
    const individualTotal = student.individualClasses * hourRate;
    const groupTotal = student.groupClasses * hourRate * groupDiscount;
    return individualTotal + groupTotal;
  };

  const calculateGrandTotal = () => {
    return students.reduce((total, student) => total + calculateTotal(student), 0);
  };

  const handleHourRateChange = (value: string) => {
    const newRate = parseFloat(value);
    if (!isNaN(newRate) && newRate > 0) {
      setHourRate(newRate);
    }
  };

  const handleGroupDiscountChange = (value: string) => {
    const newDiscount = parseFloat(value);
    if (!isNaN(newDiscount) && newDiscount > 0 && newDiscount <= 1) {
      setGroupDiscount(newDiscount);
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
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-light text-indigo-900 text-center"
          >
            Gestor de Explicações
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-indigo-600 mt-4 bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-indigo-700">Valor por Hora (Individual)</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={hourRate}
                    onChange={(e) => handleHourRateChange(e.target.value)}
                    className="w-24 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                  <span className="ml-2">€</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-indigo-700">Desconto Aulas Coletivas (%)</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={Math.round((1 - groupDiscount) * 100)}
                    onChange={(e) => handleGroupDiscountChange((100 - Number(e.target.value)) / 100)}
                    min="0"
                    max="100"
                    className="w-24 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-sm text-indigo-600">
                  Valor Aula Coletiva: {(hourRate * groupDiscount).toFixed(2)}€
                </p>
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
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
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
                      <input
                        type="number"
                        value={student.individualClasses || ''}
                        onChange={(e) => updateClasses(student.id, 'individual', Number(e.target.value))}
                        className="w-20 px-2 py-1 text-right border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        value={student.groupClasses || ''}
                        onChange={(e) => updateClasses(student.id, 'group', Number(e.target.value))}
                        className="w-20 px-2 py-1 text-right border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-indigo-900">
                      {calculateTotal(student).toFixed(2)}€
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
                ))}
                {students.length > 0 && (
                  <motion.tr 
                    className="border-t border-indigo-100 bg-indigo-50 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <td colSpan={3} className="px-6 py-4 text-right text-indigo-900">
                      Total Geral:
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
