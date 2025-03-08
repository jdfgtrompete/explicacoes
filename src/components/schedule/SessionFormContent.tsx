
import React from 'react';
import { Student } from '@/types';
import { TimeSelector } from './TimeSelector';
import { DurationSelector } from './DurationSelector';
import { ClassTypeSelector } from './ClassTypeSelector';
import { StudentSelector } from './StudentSelector';
import { GroupStudentSelector } from './GroupStudentSelector';
import { NotesField } from './NotesField';

interface SessionFormContentProps {
  hour: number;
  minute: number;
  duration: number;
  type: 'individual' | 'group';
  studentId: string;
  selectedStudents: string[];
  notes: string;
  students: Student[];
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onDurationChange: (duration: number) => void;
  onTypeChange: (type: 'individual' | 'group') => void;
  onStudentChange: (studentId: string) => void;
  onToggleStudentSelection: (studentId: string) => void;
  onNotesChange: (notes: string) => void;
  onClearSelectedStudents: () => void;
}

export const SessionFormContent: React.FC<SessionFormContentProps> = ({
  hour,
  minute,
  duration,
  type,
  studentId,
  selectedStudents,
  notes,
  students,
  onHourChange,
  onMinuteChange,
  onDurationChange,
  onTypeChange,
  onStudentChange,
  onToggleStudentSelection,
  onNotesChange,
  onClearSelectedStudents,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TimeSelector 
          hour={hour} 
          minute={minute} 
          onHourChange={onHourChange} 
          onMinuteChange={onMinuteChange} 
        />
        <DurationSelector 
          duration={duration} 
          onDurationChange={onDurationChange} 
        />
      </div>
      
      <ClassTypeSelector 
        type={type} 
        onTypeChange={onTypeChange} 
        onIndividualSelected={onClearSelectedStudents}
      />
      
      {type === 'individual' ? (
        <StudentSelector 
          studentId={studentId} 
          students={students} 
          onStudentChange={onStudentChange} 
        />
      ) : (
        <GroupStudentSelector 
          students={students} 
          selectedStudents={selectedStudents} 
          onToggleStudent={onToggleStudentSelection} 
        />
      )}
      
      <NotesField notes={notes} onNotesChange={onNotesChange} />
    </div>
  );
};
