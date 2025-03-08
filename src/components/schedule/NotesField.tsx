
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NotesFieldProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const NotesField: React.FC<NotesFieldProps> = ({ notes, onNotesChange }) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="notes" className="text-xs">Observações</Label>
      <Textarea
        id="notes"
        placeholder="Observações da aula"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={2}
        className="h-12 resize-none text-sm py-2"
      />
    </div>
  );
};
