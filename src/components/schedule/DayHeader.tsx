
import React from 'react';
import { DayHeaderProps } from './types';

export const DayHeader: React.FC<DayHeaderProps> = ({ day }) => {
  return (
    <div className="p-2 text-center font-semibold bg-blue-50 border-r">
      <div className="text-blue-800">{day.dayName}</div>
      <div className="text-blue-700">{day.dayNumber}</div>
    </div>
  );
};
