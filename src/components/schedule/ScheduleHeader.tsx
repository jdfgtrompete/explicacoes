
import React from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ScheduleHeaderProps {
  title: string;
  onRefresh?: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ title, onRefresh }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-3">
      <h1 className="text-lg font-bold text-indigo-800 flex items-center">
        <CalendarClock className="mr-2" size={18} />
        {title}
      </h1>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw size={14} />
            Atualizar
          </Button>
        )}
        <Button onClick={() => navigate('/')} variant="outline" size="sm">
          Voltar ao início
        </Button>
      </div>
    </div>
  );
};
