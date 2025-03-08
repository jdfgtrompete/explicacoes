
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { SessionFormContent } from './schedule/SessionFormContent';

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
  
  console.log("Dialog opened with students:", students);
  
  // Reset form when dialog is opened with a selected date and hour
  useEffect(() => {
    if (open && selectedDate) {
      setDate(selectedDate);
      setHour(selectedDate.getHours() || selectedHour || 9);
      setMinute(selectedDate.getMinutes() || 0);
      setDuration(1);
      setStudentId('');
      setSelectedStudents([]);
      setType('individual');
      setNotes('');
    }
  }, [open, selectedDate, selectedHour]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    let finalStudentId = studentId;
    
    // For group classes, combine student IDs
    if (type === 'group' && selectedStudents.length > 0) {
      finalStudentId = selectedStudents.join(',');
    }
    
    if (!finalStudentId) {
      console.error("No student selected");
      return;
    }
    
    console.log("Selected student ID:", finalStudentId);
    
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
      <DialogContent className="sm:max-w-[350px] p-4 max-h-[90vh] overflow-auto bg-white">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center text-blue-800">
            <CalendarClock className="mr-1" size={16} />
            Adicionar Aula
          </DialogTitle>
          <DialogDescription className="text-xs text-blue-600">
            {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <SessionFormContent 
            hour={hour}
            minute={minute}
            duration={duration}
            type={type}
            studentId={studentId}
            selectedStudents={selectedStudents}
            notes={notes}
            students={students}
            onHourChange={setHour}
            onMinuteChange={setMinute}
            onDurationChange={setDuration}
            onTypeChange={setType}
            onStudentChange={setStudentId}
            onToggleStudentSelection={toggleStudentSelection}
            onNotesChange={setNotes}
            onClearSelectedStudents={() => setSelectedStudents([])}
          />
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              onOpenChange(false);
            }} size="sm" className="h-8 text-xs">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="h-8 text-xs"
              disabled={
                (type === 'individual' && !studentId) || 
                (type === 'group' && selectedStudents.length === 0) ||
                students.length === 0
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
