
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Student } from '@/types';

interface GroupStudentSelectorProps {
  students: Student[];
  selectedStudents: string[];
  onToggleStudent: (studentId: string) => void;
}

export const GroupStudentSelector: React.FC<GroupStudentSelectorProps> = ({
  students,
  selectedStudents,
  onToggleStudent,
}) => {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Alunos da Turma</Label>
      <div className="border rounded-md p-2 h-[120px] overflow-y-auto bg-blue-50/50">
        {students && students.length > 0 ? (
          students.map(student => (
            <div key={student.id} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={`student-${student.id}`}
                checked={selectedStudents.includes(student.id)}
                onCheckedChange={() => onToggleStudent(student.id)}
                className="h-4 w-4"
              />
              <Label
                htmlFor={`student-${student.id}`}
                className="text-sm cursor-pointer"
              >
                {student.name}
              </Label>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500">Nenhum aluno disponível</p>
        )}
      </div>
      {students && students.length > 0 && selectedStudents.length === 0 && (
        <p className="text-xs text-red-500">Selecione pelo menos um aluno</p>
      )}
    </div>
  );
};
