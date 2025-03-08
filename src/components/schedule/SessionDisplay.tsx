
import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Users, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getSessionStyle, 
  getSessionColor, 
  formatTime, 
  getSessionStudents 
} from './utils';
import { SessionDisplayProps } from './types';

export const SessionDisplay: React.FC<SessionDisplayProps> = ({
  session,
  dayIndex,
  students,
  onDeleteSession
}) => {
  if (dayIndex === -1) return null; // Skip if not in current week
  
  const studentName = session.type === 'individual' 
    ? students.find(s => s.id === session.student_id)?.name || 'Aluno Desconhecido'
    : getSessionStudents(session.student_id, students).join(', ');
      
  console.log("Rendering session for student:", studentName);
  
  return (
    <div 
      key={session.id}
      style={getSessionStyle(session, dayIndex)}
      className={cn(
        "absolute rounded border px-2 py-1 shadow-sm",
        getSessionColor(session),
        "hover:shadow transition-shadow overflow-hidden"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium text-xs truncate max-w-[80%]">
          {studentName}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSession(session.id);
          }}
        >
          <Trash2 size={10} />
        </Button>
      </div>
      
      <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-1">
        <Clock size={10} />
        <span>{formatTime(session.date)}</span>
        <span className="mx-1">•</span>
        <span>{session.duration}h</span>
      </div>
      
      <div className="flex items-center text-[10px] text-gray-600 mt-1">
        {session.type === 'individual' ? (
          <User size={10} className="mr-1" />
        ) : (
          <Users size={10} className="mr-1" />
        )}
        <span>{session.type === 'individual' ? 'Individual' : 'Coletiva'}</span>
      </div>
      
      {session.notes && session.duration >= 1 && (
        <div className="text-[10px] mt-1 bg-white/60 p-1 rounded truncate">
          {session.notes}
        </div>
      )}
    </div>
  );
};
