
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, User } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  name: string;
  classes: number;
  isGroup: boolean;
}

const HOUR_RATE = 20; // Valor fixo por hora
const GROUP_DISCOUNT = 0.7; // 70% do valor para aulas coletivas

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState<Student>({
    id: '',
    name: '',
    classes: 0,
    isGroup: false
  });

  const handleAddStudent = () => {
    if (newStudent.name) {
      setStudents([...students, { ...newStudent, id: Date.now().toString() }]);
      setNewStudent({ id: '', name: '', classes: 0, isGroup: false });
    }
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const updateClasses = (id: string, classes: number) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, classes } : student
    ));
  };

  const calculateTotal = (student: Student) => {
    const baseRate = student.isGroup ? HOUR_RATE * GROUP_DISCOUNT : HOUR_RATE;
    return baseRate * student.classes;
  };

  const calculateGrandTotal = () => {
    return students.reduce((total, student) => total + calculateTotal(student), 0);
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
            className="text-indigo-600 text-center mt-4 bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm"
          >
            <p className="text-lg mb-2">Valor por Hora: {HOUR_RATE.toFixed(2)}€</p>
            <p className="text-sm">Aulas Coletivas: {(HOUR_RATE * GROUP_DISCOUNT).toFixed(2)}€</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-indigo-100 bg-white/50 space-y-4">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Nome do Aluno"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <RadioGroup
                value={newStudent.isGroup ? "group" : "individual"}
                onValueChange={(value) => setNewStudent({ ...newStudent, isGroup: value === "group" })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="flex items-center gap-1">
                    <User size={16} /> Individual
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="group" id="group" />
                  <Label htmlFor="group" className="flex items-center gap-1">
                    <Users size={16} /> Coletivo
                  </Label>
                </div>
              </RadioGroup>
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
                  <th className="px-6 py-4 text-center text-sm font-medium text-indigo-900">Tipo</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-indigo-900">Nº Aulas</th>
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
                      {student.isGroup ? 
                        <Users size={18} className="inline text-indigo-600" /> : 
                        <User size={18} className="inline text-indigo-600" />
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        value={student.classes || ''}
                        onChange={(e) => updateClasses(student.id, Number(e.target.value))}
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
