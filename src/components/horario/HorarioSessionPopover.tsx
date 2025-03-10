
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Users, User, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes: string | null;
}

interface HorarioSessionPopoverProps {
  open: boolean;
  onClose: () => void;
  day: Date;
  hour: number;
  students: Student[];
  session?: ClassSession;
  onAddSession: (data: {
    studentId: string;
    duration: number;
    type: 'individual' | 'group';
    notes: string;
  }) => Promise<void>;
  onDeleteSession: () => Promise<void>;
}

export const HorarioSessionPopover: React.FC<HorarioSessionPopoverProps> = ({
  open,
  onClose,
  day,
  hour,
  students,
  session,
  onAddSession,
  onDeleteSession
}) => {
  const [studentId, setStudentId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(1);
  const [type, setType] = useState<'individual' | 'group'>('individual');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (session) {
      if (session.type === 'group' && session.student_id.includes(',')) {
        setSelectedStudents(session.student_id.split(',').map(id => id.trim()));
        setStudentId('');
      } else {
        setStudentId(session.student_id);
        setSelectedStudents([]);
      }
      
      setDuration(session.duration);
      setType(session.type);
      setNotes(session.notes || '');
    } else {
      resetForm();
    }
  }, [session]);
  
  const resetForm = () => {
    setStudentId('');
    setSelectedStudents([]);
    setDuration(1);
    setType('individual');
    setNotes('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let finalStudentId = studentId;
      
      // For group classes, combine student IDs
      if (type === 'group' && selectedStudents.length > 0) {
        finalStudentId = selectedStudents.join(',');
      }
      
      if (!finalStudentId) {
        console.error("No student selected");
        return;
      }
      
      await onAddSession({
        studentId: finalStudentId,
        duration,
        type,
        notes
      });
      
      resetForm();
    } catch (error) {
      console.error("Error adding session:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      await onDeleteSession();
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleStudentSelection = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    );
  };
  
  const formattedDay = format(day, "EEEE, d 'de' MMMM", { locale: ptBR });
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] p-4 max-h-[90vh] overflow-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center">
            {session ? 'Editar Horário' : 'Adicionar Horário'}
          </DialogTitle>
          <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
            <Calendar size={12} />
            <span>{formattedDay}</span>
            <Clock size={12} className="ml-2" />
            <span>{hour}:00</span>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Class Type Selector */}
          <div>
            <Label className="text-xs mb-1 block">Tipo de Aula</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={type === 'individual' ? 'default' : 'outline'}
                onClick={() => {
                  setType('individual');
                  setSelectedStudents([]);
                }}
                className="flex-1 py-1 h-8 text-xs"
              >
                <User size={14} className="mr-1" />
                Individual
              </Button>
              <Button
                type="button"
                variant={type === 'group' ? 'default' : 'outline'}
                onClick={() => setType('group')}
                className="flex-1 py-1 h-8 text-xs"
              >
                <Users size={14} className="mr-1" />
                Coletiva
              </Button>
            </div>
          </div>
          
          {/* Duration Selector */}
          <div>
            <Label htmlFor="duration" className="text-xs mb-1 block">Duração</Label>
            <Select 
              value={duration.toString()} 
              onValueChange={(value) => setDuration(parseFloat(value))}
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
          
          {/* Student Selector (Individual) */}
          {type === 'individual' && (
            <div>
              <Label htmlFor="student" className="text-xs mb-1 block">Aluno</Label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
              >
                <SelectTrigger id="student" className="h-8 text-sm">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id} className="text-sm">
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Multiple Student Selector (Group) */}
          {type === 'group' && (
            <div>
              <Label className="text-xs mb-1 block">Alunos da Turma</Label>
              <div className="border rounded-md p-2 h-[120px] overflow-y-auto bg-gray-50">
                {students.map(student => (
                  <div key={student.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                      className="h-4 w-4"
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
                <p className="text-xs text-red-500 mt-1">Selecione pelo menos um aluno</p>
              )}
            </div>
          )}
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs mb-1 block">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações da aula"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="h-12 resize-none text-sm py-2"
            />
          </div>
          
          <DialogFooter className="pt-2 gap-2">
            {session && (
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                className="h-8 text-xs"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 size={12} className="mr-1" />
                Excluir
              </Button>
            )}
            <div className="flex-1"></div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              size="sm" 
              className="h-8 text-xs"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="h-8 text-xs"
              disabled={
                isLoading ||
                (type === 'individual' && !studentId) || 
                (type === 'group' && selectedStudents.length === 0)
              }
            >
              {session ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
