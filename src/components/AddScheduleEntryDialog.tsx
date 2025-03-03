
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
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
import { Checkbox } from '@/components/ui/checkbox';

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
  selectedDate?: Date;
  selectedHour?: number;
}

export const AddScheduleEntryDialog: React.FC<AddScheduleEntryDialogProps> = ({
  open,
  onOpenChange,
  students,
  onAddSession,
  selectedDate,
  selectedHour
}) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const [hour, setHour] = useState<number>(selectedHour || 8);
  const [studentId, setStudentId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(1);
  const [type, setType] = useState<'individual' | 'group'>('individual');
  const [notes, setNotes] = useState<string>('');
  
  // Reset form when dialog is opened with a selected date and hour
  useEffect(() => {
    if (open && selectedDate && selectedHour !== undefined) {
      setDate(selectedDate);
      setHour(selectedHour);
      setDuration(1);
    }
  }, [open, selectedDate, selectedHour]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    let finalStudentId = studentId;
    
    // For group classes, combine student IDs
    if (type === 'group' && selectedStudents.length > 0) {
      finalStudentId = selectedStudents.join(',');
    } else if (type === 'group' && studentId) {
      finalStudentId = studentId;
    }
    
    if (!finalStudentId) return;
    
    // Add time to the date
    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);
    
    onAddSession({
      studentId: finalStudentId,
      date: dateTime,
      duration,
      type,
      notes
    });
    
    // Reset the form
    resetForm();
  };
  
  const resetForm = () => {
    setStudentId('');
    setSelectedStudents([]);
    setDuration(1);
    setType('individual');
    setNotes('');
  };
  
  const toggleStudentSelection = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    );
  };
  
  const timeOptions = Array.from({ length: 13 }, (_, i) => i + 8);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarClock className="mr-2" size={18} />
            Adicionar Nova Aula
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <div className="border rounded-md p-2 bg-gray-50">
                {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
              </div>
            </div>
            
            <div>
              <Label htmlFor="hour">Hora</Label>
              <Select value={hour.toString()} onValueChange={(value) => setHour(parseInt(value))}>
                <SelectTrigger id="hour">
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label>Tipo de Aula</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={type === 'individual' ? 'default' : 'outline'}
                onClick={() => {
                  setType('individual');
                  setSelectedStudents([]);
                }}
                className="flex-1 py-1 h-8"
              >
                <User size={14} className="mr-1" />
                Individual
              </Button>
              <Button
                type="button"
                variant={type === 'group' ? 'default' : 'outline'}
                onClick={() => setType('group')}
                className="flex-1 py-1 h-8"
              >
                <Users size={14} className="mr-1" />
                Coletiva
              </Button>
            </div>
          </div>
          
          {type === 'individual' ? (
            <div className="space-y-1">
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
          ) : (
            <div className="space-y-1">
              <Label>Alunos da Turma</Label>
              <div className="border rounded-md p-2 h-[120px] overflow-y-auto">
                {students.map(student => (
                  <div key={student.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                    />
                    <Label
                      htmlFor={`student-${student.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {student.name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedStudents.length === 0 && (
                <p className="text-xs text-red-500">Selecione pelo menos um aluno</p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="duration" className="flex items-center">
                <Clock size={14} className="mr-1" />
                Duração (horas)
              </Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseFloat(value))}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="1.5">1.5</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="2.5">2.5</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações ou detalhes sobre a aula"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="h-12 resize-none"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              onOpenChange(false);
            }} size="sm">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={type === 'individual' ? !studentId : selectedStudents.length === 0}
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
