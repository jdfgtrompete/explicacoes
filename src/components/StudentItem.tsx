
import { ChevronDown, Trash2, User, Users } from 'lucide-react';
import { Student, WeeklyRecord, StudentRate } from '@/types';
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
  studentRate?: StudentRate;
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
}

export const StudentItem = ({
  student,
  weeklyRecords,
  monthlyTotal,
  studentRate,
  onRemoveStudent,
  onUpdateClasses,
  onUpdateRates
}: StudentItemProps) => {
  const individualRate = studentRate?.individual_rate || 14;
  const groupRate = studentRate?.group_rate || 10;

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
        <div className="mt-4">
          {/* Taxas do aluno */}
          <div className="bg-blue-50/50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-indigo-900 mb-2">Preços por Hora</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">
                  <User size={14} className="inline mr-1" />
                  Preço/Hora Individual (€)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={individualRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    onUpdateRates(
                      student.id,
                      'individual',
                      isNaN(value) ? 0 : value
                    );
                  }}
                  className="w-24 px-3 py-1 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">
                  <Users size={14} className="inline mr-1" />
                  Preço/Hora Coletiva (€)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={groupRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    onUpdateRates(
                      student.id,
                      'group',
                      isNaN(value) ? 0 : value
                    );
                  }}
                  className="w-24 px-3 py-1 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Registros semanais */}
          <div className="space-y-4">
            {weeklyRecords.map((record) => (
              <WeeklyRecordItem
                key={record.id}
                record={record}
                onUpdateClasses={onUpdateClasses}
                studentRate={studentRate}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
