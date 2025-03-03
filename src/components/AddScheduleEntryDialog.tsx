
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Clock, CalendarClock, User, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddScheduleEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  onAddSession: (data: {
    studentId: string;
    date: Date;
    duration: number;
    type: 'individual' | 'group';
    notes: string;
  }) => void;
}

export const AddScheduleEntryDialog: React.FC<AddScheduleEntryDialogProps> = ({
  open,
  onOpenChange,
  students,
  onAddSession
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentId, setStudentId] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [type, setType] = useState<'individual' | 'group'>('individual');
  const [notes, setNotes] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !studentId) return;
    
    onAddSession({
      studentId,
      date,
      duration,
      type,
      notes
    });
    
    // Resetar o formulário
    setStudentId('');
    setDuration(1);
    setType('individual');
    setNotes('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarClock className="mr-2" size={18} />
            Adicionar Nova Aula
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Aluno</Label>
            <Select
              value={studentId}
              onValueChange={setStudentId}
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Data</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md p-3"
              locale={ptBR}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center">
              <Clock size={14} className="mr-1" />
              Duração (horas)
            </Label>
            <Input
              id="duration"
              type="number"
              min="0.5"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Aula</Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={type === 'individual' ? 'default' : 'outline'}
                onClick={() => setType('individual')}
                className="flex-1"
              >
                <User size={16} className="mr-1" />
                Individual
              </Button>
              <Button
                type="button"
                variant={type === 'group' ? 'default' : 'outline'}
                onClick={() => setType('group')}
                className="flex-1"
              >
                <Users size={16} className="mr-1" />
                Coletiva
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações ou detalhes sobre a aula"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
