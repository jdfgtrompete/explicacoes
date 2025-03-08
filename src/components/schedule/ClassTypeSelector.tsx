
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Users } from 'lucide-react';

interface ClassTypeSelectorProps {
  type: 'individual' | 'group';
  onTypeChange: (type: 'individual' | 'group') => void;
  onIndividualSelected: () => void;
}

export const ClassTypeSelector: React.FC<ClassTypeSelectorProps> = ({
  type,
  onTypeChange,
  onIndividualSelected,
}) => {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Tipo de Aula</Label>
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={type === 'individual' ? 'default' : 'outline'}
          onClick={() => {
            onTypeChange('individual');
            onIndividualSelected();
          }}
          className="flex-1 py-0 h-8 text-xs"
        >
          <User size={12} className="mr-1" />
          Individual
        </Button>
        <Button
          type="button"
          variant={type === 'group' ? 'default' : 'outline'}
          onClick={() => onTypeChange('group')}
          className="flex-1 py-0 h-8 text-xs"
        >
          <Users size={12} className="mr-1" />
          Coletiva
        </Button>
      </div>
    </div>
  );
};
