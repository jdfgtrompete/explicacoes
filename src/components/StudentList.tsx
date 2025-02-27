
import { Student, WeeklyRecord, StudentRate } from '@/types';
import { StudentItem } from './StudentItem';

interface StudentListProps {
  students: Student[];
  weeklyRecords: WeeklyRecord[];
  studentRates: StudentRate[];
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
    type: 'individual' | 'group',
    value: number
  ) => Promise<void>;
  calculateMonthlyTotal: (studentId: string) => number;
  getStudentWeeks: (studentId: string) => WeeklyRecord[];
}

export const StudentList = ({
  students,
  weeklyRecords,
  studentRates,
  onRemoveStudent,
  onUpdateClasses,
  onUpdateRates,
  calculateMonthlyTotal,
  getStudentWeeks
}: StudentListProps) => {
  const getStudentRate = (studentId: string): StudentRate | undefined => {
    return studentRates.find(rate => rate.student_id === studentId);
  };

  return (
    <div className="divide-y divide-indigo-100">
      {students.map((student) => (
        <StudentItem
          key={student.id}
          student={student}
          weeklyRecords={getStudentWeeks(student.id)}
          monthlyTotal={calculateMonthlyTotal(student.id)}
          studentRate={getStudentRate(student.id)}
          onRemoveStudent={onRemoveStudent}
          onUpdateClasses={onUpdateClasses}
          onUpdateRates={onUpdateRates}
        />
      ))}
    </div>
  );
};
