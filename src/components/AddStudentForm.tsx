
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface AddStudentFormProps {
  onAddStudent: (name: string) => Promise<void>;
}

export const AddStudentForm = ({ onAddStudent }: AddStudentFormProps) => {
  const [newStudentName, setNewStudentName] = useState('');

  const handleSubmit = async () => {
    if (newStudentName.trim()) {
      await onAddStudent(newStudentName);
      setNewStudentName('');
    }
  };

  return (
    <div className="flex gap-4 flex-1">
      <input
        type="text"
        placeholder="Nome do Aluno"
        value={newStudentName}
        onChange={(e) => setNewStudentName(e.target.value)}
        className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
      >
        <Plus size={18} />
        Adicionar Aluno
      </button>
    </div>
  );
};
