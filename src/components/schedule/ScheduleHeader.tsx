
import React from 'react';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ScheduleHeaderProps {
  title: string;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-3">
      <h1 className="text-lg font-bold text-indigo-800 flex items-center">
        <CalendarClock className="mr-2" size={18} />
        {title}
      </h1>
      <Button onClick={() => navigate('/')} variant="outline" size="sm">
        Voltar ao início
      </Button>
    </div>
  );
};
