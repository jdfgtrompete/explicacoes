
import { User, Users } from 'lucide-react';
import { WeeklyRecord } from '@/types';

interface WeeklyRecordItemProps {
  record: WeeklyRecord;
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

export const WeeklyRecordItem = ({
  record,
  onUpdateClasses,
  onUpdateRates
}: WeeklyRecordItemProps) => {
  const weekTotal = 
    (record.individual_classes * record.individual_rate) +
    (record.group_classes * record.group_rate);

  return (
    <div className="bg-indigo-50/50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-indigo-900">Semana {record.week_number}</h3>
        <span className="text-sm font-medium text-indigo-600">
          Total da semana: {weekTotal.toFixed(2)}€
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-indigo-700 mb-1">
            Preço/Hora Individual (€)
          </label>
          <input
            type="number"
            step="0.5"
            value={record.individual_rate}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              onUpdateRates(
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
            Preço/Hora Coletiva (€)
          </label>
          <input
            type="number"
            step="0.5"
            value={record.group_rate}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              onUpdateRates(
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
