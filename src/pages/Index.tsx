
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  hourlyRate: number;
  classes: number;
}

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState<Student>({
    id: '',
    name: '',
    hourlyRate: 0,
    classes: 0
  });

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.hourlyRate > 0) {
      setStudents([...students, { ...newStudent, id: Date.now().toString() }]);
      setNewStudent({ id: '', name: '', hourlyRate: 0, classes: 0 });
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
    return student.hourlyRate * student.classes;
  };

  const calculateGrandTotal = () => {
    return students.reduce((total, student) => total + calculateTotal(student), 0);
  };

  return (
    <div className="min-h-screen bg-white p-8">
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
            className="text-3xl font-light text-gray-800 text-center"
          >
            Gestor de Explicações
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-center mt-2"
          >
            Controle de pagamentos de alunos
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden mb-6"
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
            <input
              type="text"
              placeholder="Nome do Aluno"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Valor/Hora"
              value={newStudent.hourlyRate || ''}
              onChange={(e) => setNewStudent({ ...newStudent, hourlyRate: Number(e.target.value) })}
              className="w-32 px-3 py-2 border rounded-md"
            />
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={18} />
              Adicionar Aluno
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Nome</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Valor/Hora</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Nº Aulas</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Total</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-gray-200">
                    <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-800">
                      {student.hourlyRate.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        value={student.classes || ''}
                        onChange={(e) => updateClasses(student.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 text-right border rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">
                      {calculateTotal(student).toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length > 0 && (
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-800">
                      Total Geral:
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">
                      {calculateGrandTotal().toFixed(2)}€
                    </td>
                    <td></td>
                  </tr>
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
