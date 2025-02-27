
import { User, Users } from 'lucide-react';
import { WeeklyRecord, StudentRate } from '@/types';

interface WeeklyRecordItemProps {
  record: WeeklyRecord;
  onUpdateClasses: (
    studentId: string,
    weekNumber: number,
    type: 'individual' | 'group',
    value: number
  ) => Promise<void>;
  studentRate?: StudentRate;
}

export const WeeklyRecordItem = ({
  record,
  onUpdateClasses,
  studentRate
}: WeeklyRecordItemProps) => {
  // Usar a taxa do aluno se disponível, caso contrário usar a do registro
  const individualRate = studentRate?.individual_rate || record.individual_rate;
  const groupRate = studentRate?.group_rate || record.group_rate;

  const weekTotal = 
    (record.individual_classes * individualRate) +
    (record.group_classes * groupRate);

  return (
    <div className="bg-indigo-50/50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-indigo-900">Semana {record.week_number}</h3>
        <span className="text-sm font-medium text-indigo-600">
          Total da semana: {weekTotal.toFixed(2)}€
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-indigo-700 mb-1">
            <User size={14} className="inline mr-1" />
            Horas Individuais
          </label>
          <input
            type="number"
            step="0.5"
            value={record.individual_classes}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              onUpdateClasses(
                record.student_id,
                record.week_number,
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
            Horas Coletivas
          </label>
          <input
            type="number"
            step="0.5"
            value={record.group_classes}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              onUpdateClasses(
                record.student_id,
                record.week_number,
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
  );
};
