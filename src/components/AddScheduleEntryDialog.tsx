
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { Clock, CalendarClock, User, Users } from 'lucide-react';
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
  const [studentId, setStudentId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [hour, setHour] = useState<number>(selectedHour || 9);
  const [minute, setMinute] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);
  const [type, setType] = useState<'individual' | 'group'>('individual');
  const [notes, setNotes] = useState<string>('');
  
  // Reset form when dialog is opened with a selected date and hour
  useEffect(() => {
    if (open && selectedDate) {
      setDate(selectedDate);
      setHour(selectedHour || 9);
      setMinute(0);
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
    dateTime.setHours(hour, minute, 0, 0);
    
    console.log("Submitting with date:", dateTime, "and student ID:", finalStudentId);
    
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
    setHour(9);
    setMinute(0);
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[280px] p-3 max-h-[90vh] overflow-auto bg-white">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center text-xs text-indigo-800">
            <CalendarClock className="mr-1" size={14} />
            Adicionar Aula
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="text-xs font-medium text-indigo-700 bg-indigo-50 p-1 rounded">
            {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="hour" className="text-xs flex items-center">
                <Clock size={10} className="mr-1" />
                Hora
              </Label>
              <Select value={hour.toString()} onValueChange={(value) => setHour(parseInt(value))}>
                <SelectTrigger id="hour" className="h-6 text-[10px]">
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => i + 8).map(h => (
                    <SelectItem key={h} value={h.toString()} className="text-[10px]">
                      {h}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="duration" className="text-xs flex items-center">
                <Clock size={10} className="mr-1" />
                Duração
              </Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseFloat(value))}>
                <SelectTrigger id="duration" className="h-6 text-[10px]">
                  <SelectValue placeholder="Duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5" className="text-[10px]">0.5h</SelectItem>
                  <SelectItem value="1" className="text-[10px]">1h</SelectItem>
                  <SelectItem value="1.5" className="text-[10px]">1.5h</SelectItem>
                  <SelectItem value="2" className="text-[10px]">2h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Tipo de Aula</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={type === 'individual' ? 'default' : 'outline'}
                onClick={() => {
                  setType('individual');
                  setSelectedStudents([]);
                }}
                className="flex-1 py-0 h-6 text-[10px]"
              >
                <User size={10} className="mr-1" />
                Individual
              </Button>
              <Button
                type="button"
                variant={type === 'group' ? 'default' : 'outline'}
                onClick={() => setType('group')}
                className="flex-1 py-0 h-6 text-[10px]"
              >
                <Users size={10} className="mr-1" />
                Coletiva
              </Button>
            </div>
          </div>
          
          {type === 'individual' ? (
            <div className="space-y-1">
              <Label htmlFor="student" className="text-xs">Aluno</Label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
              >
                <SelectTrigger id="student" className="h-6 text-[10px]">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id} className="text-[10px]">
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">Alunos da Turma</Label>
              <div className="border rounded-md p-1 h-[70px] overflow-y-auto bg-indigo-50/50">
                {students.map(student => (
                  <div key={student.id} className="flex items-center space-x-1 py-0.5">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                      className="h-3 w-3"
                    />
                    <Label
                      htmlFor={`student-${student.id}`}
                      className="text-[10px] cursor-pointer"
                    >
                      {student.name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedStudents.length === 0 && (
                <p className="text-[8px] text-red-500">Selecione pelo menos um aluno</p>
              )}
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações da aula"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="h-10 resize-none text-[10px] py-1"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              onOpenChange(false);
            }} size="sm" className="h-6 text-[10px]">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="h-6 text-[10px]"
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
