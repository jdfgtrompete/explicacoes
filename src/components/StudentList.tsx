
import { Student, WeeklyRecord } from '@/types';
import { StudentItem } from './StudentItem';

interface StudentListProps {
  students: Student[];
  weeklyRecords: WeeklyRecord[];
  currentMonth: string;
  onRemoveStudent: (id: string) => Promise<void>;
  onUpdateClasses: (
    studentId: string,
    weekNumber: number,
    type: 'individual' | 'group',
    value: number
  ) => Promise<void>;
  onUpdateRates: (
    studentId: string,
    weekNumber: number,
    type: 'individual' | 'group',
    value: number
  ) => Promise<void>;
  calculateMonthlyTotal: (studentId: string) => number;
  getStudentWeeks: (studentId: string) => WeeklyRecord[];
}

export const StudentList = ({
  students,
  weeklyRecords,
  onRemoveStudent,
  onUpdateClasses,
  onUpdateRates,
  calculateMonthlyTotal,
  getStudentWeeks
}: StudentListProps) => {
  return (
    <div className="divide-y divide-indigo-100">
      {students.map((student) => (
        <StudentItem
          key={student.id}
          student={student}
          weeklyRecords={getStudentWeeks(student.id)}
          monthlyTotal={calculateMonthlyTotal(student.id)}
          onRemoveStudent={onRemoveStudent}
          onUpdateClasses={onUpdateClasses}
          onUpdateRates={onUpdateRates}
        />
      ))}
    </div>
  );
};
