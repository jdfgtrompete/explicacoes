
import { Plus } from 'lucide-react';

interface AddWeekButtonProps {
  onAddWeek: () => Promise<void>;
  disabled: boolean;
}

export const AddWeekButton = ({ onAddWeek, disabled }: AddWeekButtonProps) => {
  return (
    <button
      onClick={onAddWeek}
      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
      disabled={disabled}
    >
      <Plus size={18} />
      Adicionar Nova Semana
    </button>
  );
};
