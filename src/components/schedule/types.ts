
import { Student } from '@/types';

export interface ClassSession {
  id: string;
  student_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes: string | null;
  created_at?: string;
  user_id?: string;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: string;
  dateStr: string;
}

export interface SessionDisplayProps {
  session: ClassSession;
  dayIndex: number;
  students: Student[];
  onDeleteSession: (sessionId: string) => Promise<void>;
}

export interface DayHeaderProps {
  day: WeekDay;
}

export interface TimeSlotProps {
  timeSlot: string;
  weekDays: WeekDay[];
  onAddSession: (day: Date, hour: number) => void;
}
