
import { motion } from 'framer-motion';
import { CalendarIcon, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  email: string | undefined;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  handleLogout: () => Promise<void>;
}

export const Header = ({ email, currentMonth, setCurrentMonth, handleLogout }: HeaderProps) => {
  return (
    <div className="mb-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-4xl font-light text-indigo-900 flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Gestor de Explicações
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-indigo-600">{email}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </motion.div>
    </div>
  );
};
