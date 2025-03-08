
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

interface DurationSelectorProps {
  duration: number;
  onDurationChange: (duration: number) => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  duration,
  onDurationChange,
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="duration" className="text-xs flex items-center">
        <Clock size={12} className="mr-1" />
        Duração
      </Label>
      <Select 
        value={duration.toString()} 
        onValueChange={(value) => onDurationChange(parseFloat(value))}
      >
        <SelectTrigger id="duration" className="h-8 text-sm">
          <SelectValue placeholder="Duração" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0.5" className="text-sm">0.5h</SelectItem>
          <SelectItem value="1" className="text-sm">1h</SelectItem>
          <SelectItem value="1.5" className="text-sm">1.5h</SelectItem>
          <SelectItem value="2" className="text-sm">2h</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
