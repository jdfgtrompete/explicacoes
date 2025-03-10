
import React from 'react';

interface TimeSlotProps {
  time: string;
  dayIndex: number;
  onAddSession: (dayIndex: number, hour: number) => void;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ time, dayIndex, onAddSession }) => {
  const hour = parseInt(time.split(':')[0]);
  
  return (
    <div 
      className="border-r border-gray-200 h-full hover:bg-blue-50 cursor-pointer transition-colors"
      onClick={() => onAddSession(dayIndex, hour)}
    />
  );
};
