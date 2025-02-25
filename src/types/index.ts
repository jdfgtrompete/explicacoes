
export interface Student {
  id: string;
  name: string;
  user_id: string;
}

export interface ClassSession {
  id: string;
  student_id: string;
  user_id: string;
  date: string;
  duration: number;
  type: 'individual' | 'group';
  notes?: string;
  created_at: string;
}
