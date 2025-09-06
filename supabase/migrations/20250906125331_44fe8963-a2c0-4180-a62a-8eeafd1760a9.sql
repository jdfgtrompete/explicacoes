-- Create custom auth table for username-based authentication
CREATE TABLE public.auth_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.auth_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for auth_users (only allow users to see their own data)
CREATE POLICY "Users can view their own auth data" 
ON public.auth_users 
FOR SELECT 
USING (id = auth.uid());

-- Create function to update timestamps
CREATE TRIGGER update_auth_users_updated_at
  BEFORE UPDATE ON public.auth_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_auth_users_username ON public.auth_users(username);