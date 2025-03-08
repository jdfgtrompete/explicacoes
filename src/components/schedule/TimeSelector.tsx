
import React from 'react';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeSelectorProps {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="hour" className="text-xs flex items-center">
        <Clock size={12} className="mr-1" />
        Hora
      </Label>
      <div className="flex space-x-1">
        <Select 
          value={hour.toString()} 
          onValueChange={(value) => onHourChange(parseInt(value))}
        >
          <SelectTrigger id="hour" className="h-8 text-sm flex-1">
            <SelectValue placeholder="Hora" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 13 }, (_, i) => i + 8).map(h => (
              <SelectItem key={h} value={h.toString()} className="text-sm">
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center">:</span>
        <Select 
          value={minute.toString()} 
          onValueChange={(value) => onMinuteChange(parseInt(value))}
        >
          <SelectTrigger id="minute" className="h-8 text-sm flex-1">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" className="text-sm">00</SelectItem>
            <SelectItem value="30" className="text-sm">30</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
