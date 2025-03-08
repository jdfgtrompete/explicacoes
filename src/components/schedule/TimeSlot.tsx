
import React from 'react';

interface TimeSlotProps {
  time: string;
  dayIndex: number;
  onAddSession: (dayIndex: number, hour: number) => void;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ time, dayIndex, onAddSession }) => {
  const hour = parseInt(time.split(':')[0]);
  const minute = parseInt(time.split(':')[1]);
  
  return (
    <div 
      className="border-r relative border-gray-100"
      onClick={() => onAddSession(dayIndex, hour)}
    />
  );
};
