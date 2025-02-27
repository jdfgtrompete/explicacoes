
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
  individual_classes: number;
  group_classes: number;
  individual_rate: number;
  group_rate: number;
}

export interface StudentRate {
  id?: string;
  student_id: string;
  user_id?: string;
  individual_rate: number;
  group_rate: number;
}
