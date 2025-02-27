
import { ChevronDown, Trash2 } from 'lucide-react';
import { Student, WeeklyRecord } from '@/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WeeklyRecordItem } from './WeeklyRecordItem';

interface StudentItemProps {
  student: Student;
  weeklyRecords: WeeklyRecord[];
  monthlyTotal: number;
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
}

export const StudentItem = ({
  student,
  weeklyRecords,
  monthlyTotal,
  onRemoveStudent,
  onUpdateClasses,
  onUpdateRates
}: StudentItemProps) => {
  return (
    <Collapsible className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CollapsibleTrigger className="flex items-center gap-2 hover:text-indigo-600">
            <ChevronDown className="h-4 w-4" />
            <span className="font-medium">{student.name}</span>
          </CollapsibleTrigger>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-indigo-900">
            Total: {monthlyTotal.toFixed(2)}€
          </span>
          <button
            onClick={() => onRemoveStudent(student.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Remover aluno"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <CollapsibleContent>
        <div className="mt-4 space-y-4">
          {weeklyRecords.map((record) => (
            <WeeklyRecordItem
              key={record.id}
              record={record}
              onUpdateClasses={onUpdateClasses}
              onUpdateRates={onUpdateRates}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
