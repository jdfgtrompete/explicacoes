
import { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClassSession } from "@/types";

interface ClassSessionFormProps {
  onSubmit: (sessionData: Partial<ClassSession>) => Promise<void>;
  onClose: () => void;
}

export const ClassSessionForm = ({ onSubmit, onClose }: ClassSessionFormProps) => {
  const [classDate, setClassDate] = useState('');
  const [classDuration, setClassDuration] = useState('');
  const [classType, setClassType] = useState<'individual' | 'group'>('individual');
  const [classNotes, setClassNotes] = useState('');

  const handleSubmit = async () => {
    await onSubmit({
      date: classDate,
      duration: Number(classDuration),
      type: classType,
      notes: classNotes,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Registrar Nova Aula</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label>Data da Aula</label>
          <Input
            type="date"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label>Duração (horas)</label>
          <Input
            type="number"
            step="0.5"
            min="0.5"
            value={classDuration}
            onChange={(e) => setClassDuration(e.target.value)}
            placeholder="Ex: 1.5"
          />
        </div>
        <div className="grid gap-2">
          <label>Tipo de Aula</label>
          <Select value={classType} onValueChange={(value: 'individual' | 'group') => setClassType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Coletiva</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label>Notas (opcional)</label>
          <Textarea
            value={classNotes}
            onChange={(e) => setClassNotes(e.target.value)}
            placeholder="Adicione notas sobre a aula..."
          />
        </div>
        <Button onClick={handleSubmit}>
          Registrar Aula
        </Button>
      </div>
    </DialogContent>
  );
};
