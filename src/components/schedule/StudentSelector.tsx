
import React from 'react';
import { Label } from '@/components/ui/label';
import { Student } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentSelectorProps {
  studentId: string;
  students: Student[];
  onStudentChange: (studentId: string) => void;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  studentId,
  students,
  onStudentChange,
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="student" className="text-xs">Aluno</Label>
      <Select
        value={studentId}
        onValueChange={(value) => {
          console.log("Selected student ID:", value);
          onStudentChange(value);
        }}
      >
        <SelectTrigger id="student" className="h-8 text-sm">
          <SelectValue placeholder="Selecione um aluno" />
        </SelectTrigger>
        <SelectContent>
          {students && students.length > 0 ? (
            students.map(student => (
              <SelectItem key={student.id} value={student.id} className="text-sm">
                {student.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="nenhum" disabled className="text-sm">
              Nenhum aluno disponível
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {students && students.length === 0 && (
        <p className="text-xs text-red-500">Você precisa adicionar alunos primeiro</p>
      )}
    </div>
  );
};
