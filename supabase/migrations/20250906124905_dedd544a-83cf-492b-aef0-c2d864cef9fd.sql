-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_rates table
CREATE TABLE public.student_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  individual_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  group_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_records table
CREATE TABLE public.weekly_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  individual_classes INTEGER NOT NULL DEFAULT 0,
  group_classes INTEGER NOT NULL DEFAULT 0,
  individual_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  group_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students
CREATE POLICY "Users can view their own students" 
ON public.students 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own students" 
ON public.students 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students" 
ON public.students 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students" 
ON public.students 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for student_rates
CREATE POLICY "Users can view their own student rates" 
ON public.student_rates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own student rates" 
ON public.student_rates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student rates" 
ON public.student_rates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own student rates" 
ON public.student_rates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for weekly_records
CREATE POLICY "Users can view their own weekly records" 
ON public.weekly_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly records" 
ON public.weekly_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly records" 
ON public.weekly_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly records" 
ON public.weekly_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_rates_updated_at
  BEFORE UPDATE ON public.student_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_records_updated_at
  BEFORE UPDATE ON public.weekly_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_student_rates_user_id ON public.student_rates(user_id);
CREATE INDEX idx_student_rates_student_id ON public.student_rates(student_id);
CREATE INDEX idx_weekly_records_user_id ON public.weekly_records(user_id);
CREATE INDEX idx_weekly_records_student_id ON public.weekly_records(student_id);
CREATE INDEX idx_weekly_records_year_month ON public.weekly_records(year, month);