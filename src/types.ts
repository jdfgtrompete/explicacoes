
export interface Student {
  id: string;
  name: string;
  user_id: string;
}

export interface WeeklyRecord {
  id?: string;
  student_id: string;
  user_id: string;
  week_number: number;
  month: string;
  year: number;
  individual_hours: number;
  group_hours: number;
  individual_rate: number;
  group_rate: number;
}
