
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DayHeaderProps {
  date: Date;
}

export const DayHeader: React.FC<DayHeaderProps> = ({ date }) => {
  const dayName = format(date, 'EEE', { locale: ptBR });
  const dayNumber = format(date, 'd', { locale: ptBR });
  
  return (
    <div className="p-2 text-center font-semibold bg-blue-50 border-r">
      <div className="text-blue-800">{dayName}</div>
      <div className="text-blue-700">{dayNumber}</div>
    </div>
  );
};
