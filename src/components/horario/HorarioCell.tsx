
import React from 'react';
import { Clock, Users, User } from 'lucide-react';
import { Student } from '@/types';
import { cn } from '@/lib/utils';

interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes: string | null;
}

interface HorarioCellProps {
  session?: ClassSession;
  students: Student[];
  onClick: () => void;
}

export const HorarioCell: React.FC<HorarioCellProps> = ({
  session,
  students,
  onClick
}) => {
  // Get student name by ID
  const getStudentName = (studentId: string): string => {
    if (!studentId) return 'Aluno Desconhecido';
    
    if (studentId.includes(',')) {
      const studentIds = studentId.split(',');
      const studentNames = studentIds.map(id => {
        const student = students.find(s => s.id === id.trim());
        return student ? student.name.split(' ')[0] : 'Aluno Desconhecido';
      });
      return studentNames.join(', ');
    }
    
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Aluno Desconhecido';
  };
  
  if (!session) {
    return (
      <div 
        className="border min-h-[64px] hover:bg-blue-50 transition-colors cursor-pointer"
        onClick={onClick}
      />
    );
  }
  
  // For existing session cells
  const studentName = getStudentName(session.student_id);
  const isGroup = session.type === 'group';
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "border p-2 min-h-[64px] cursor-pointer",
        isGroup ? "bg-green-50 hover:bg-green-100" : "bg-blue-50 hover:bg-blue-100",
        "transition-colors"
      )}
    >
      <div className="font-medium text-sm truncate">
        {studentName}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
        <Clock size={10} />
        <span>{session.duration}h</span>
        {isGroup ? (
          <Users size={10} className="ml-1" />
        ) : (
          <User size={10} className="ml-1" />
        )}
      </div>
      
      {session.notes && (
        <div className="text-xs mt-1 truncate text-gray-500">
          {session.notes}
        </div>
      )}
    </div>
  );
};
