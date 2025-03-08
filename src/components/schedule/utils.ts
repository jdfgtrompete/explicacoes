
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { ClassSession, WeekDay } from './types';

// Constants for the schedule display
export const HOURS_START = 8; // 8 AM
export const HOURS_END = 20; // 8 PM
export const CELL_HEIGHT = 25; // Height of each half-hour cell in pixels

// Helper functions
export const getStudentName = (studentId: string, students: Student[]): string => {
  if (!studentId) return 'Aluno Desconhecido';
  
  console.log("Looking for student with ID:", studentId);
  const student = students.find(s => s.id === studentId);
  console.log("Found student:", student);
  return student ? student.name : 'Aluno Desconhecido';
};

export const getSessionStudents = (sessionStudentId: string, students: Student[]): string[] => {
  if (!sessionStudentId) return ['Aluno Desconhecido'];
  
  if (!sessionStudentId.includes(',')) {
    return [getStudentName(sessionStudentId, students)];
  }
  
  const studentIds = sessionStudentId.split(',');
  return studentIds.map(id => getStudentName(id.trim(), students));
};

export const parseSessionDateTime = (dateStr: string): Date => {
  try {
    return new Date(dateStr);
  } catch (e) {
    console.error("Error parsing datetime:", dateStr, e);
    return new Date();
  }
};

export const formatTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, 'HH:mm');
  } catch (e) {
    console.error("Error formatting time:", dateStr, e);
    return "00:00";
  }
};

export const getSessionStyle = (session: ClassSession, dayIndex: number) => {
  const sessionDate = parseSessionDateTime(session.date);
  const sessionHour = sessionDate.getHours();
  const sessionMinute = sessionDate.getMinutes();
  
  // Calculate position based on time
  const hourPosition = sessionHour - HOURS_START;
  const minutePosition = sessionMinute / 30; // Each 30 min is a cell
  const timePosition = (hourPosition * 2 + minutePosition) * CELL_HEIGHT;
  
  // Calculate height based on duration (convert hours to pixels)
  const heightCells = session.duration * 2; // Each hour is 2 cells
  const heightValue = heightCells * CELL_HEIGHT;
  
  // Column width calculation (7 days, each taking equal space)
  const leftPosition = (dayIndex * (100 / 7)) + '%';
  const widthValue = (100 / 7) - 0.5 + '%'; // Subtract a small amount for spacing
  
  return {
    position: 'absolute' as const,
    top: `${timePosition}px`,
    height: `${heightValue}px`,
    left: leftPosition,
    width: widthValue,
    zIndex: 10
  };
};

export const getSessionColor = (session: ClassSession) => {
  return session.type === 'individual' 
    ? 'bg-blue-100 border-blue-400 hover:bg-blue-200'
    : 'bg-green-100 border-green-400 hover:bg-green-200';
};

export const createWeekDays = (weekStart: Date): WeekDay[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return {
      date: day,
      dayName: format(day, 'EEE', { locale: ptBR }),
      dayNumber: format(day, 'd', { locale: ptBR }),
      dateStr: format(day, 'yyyy-MM-dd')
    };
  });
};

export const generateTimeSlots = (): string[] => {
  const timeSlots = [];
  for (let hour = HOURS_START; hour < HOURS_END; hour++) {
    timeSlots.push(hour + ':00');
    timeSlots.push(hour + ':30');
  }
  return timeSlots;
};

export const isSessionInWeek = (session: ClassSession, weekDays: WeekDay[]): number => {
  const sessionDate = parseSessionDateTime(session.date);
  // Find which day column this session belongs to
  return weekDays.findIndex(day => 
    isSameDay(day.date, sessionDate)
  );
};
