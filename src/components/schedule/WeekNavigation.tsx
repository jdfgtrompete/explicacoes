
import React from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekNavigationProps {
  currentWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeek,
  onPreviousWeek,
  onNextWeek
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const formattedDateRange = `${format(weekStart, 'd', { locale: ptBR })} - ${format(weekEnd, 'd \'de\' MMMM, yyyy', { locale: ptBR })}`;
  
  return (
    <div className="flex items-center justify-between mb-3 bg-blue-50 p-2 rounded-md">
      <Button 
        onClick={onPreviousWeek} 
        variant="outline" 
        size="sm"
        className="flex items-center text-xs bg-white"
      >
        <ChevronLeft className="mr-1" size={14} />
        Anterior
      </Button>
      
      <h2 className="text-sm font-medium text-blue-800">
        {formattedDateRange}
      </h2>
      
      <Button 
        onClick={onNextWeek} 
        variant="outline" 
        size="sm"
        className="flex items-center text-xs bg-white"
      >
        Próxima
        <ChevronRight className="ml-1" size={14} />
      </Button>
    </div>
  );
};
