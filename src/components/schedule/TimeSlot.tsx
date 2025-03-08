
import React from 'react';
import { TimeSlotProps } from './types';

export const TimeSlot: React.FC<TimeSlotProps> = ({ timeSlot, weekDays, onAddSession }) => {
  return (
    <div 
      className="grid grid-cols-8 border-b border-gray-100"
      style={{ height: `25px` }}
    >
      <div className="text-xs text-gray-500 p-1 border-r text-center">
        {timeSlot}
      </div>
      {/* Empty day cells */}
      {weekDays.map((day, dayIndex) => (
        <div 
          key={`cell-${timeSlot}-${dayIndex}`}
          className="border-r relative border-gray-100"
          onClick={() => {
            const hour = parseInt(timeSlot.split(':')[0]);
            const minute = parseInt(timeSlot.split(':')[1]);
            const date = new Date(day.date);
            date.setHours(hour, minute);
            onAddSession(date, hour);
          }}
        />
      ))}
    </div>
  );
};
