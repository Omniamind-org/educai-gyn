-- Create students table for secretary-managed student accounts
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  grade TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policies for students table
-- Secretaria can manage all students
CREATE POLICY "Secretaria can view all students"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretaria'
    )
  );

CREATE POLICY "Secretaria can insert students"
  ON public.students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretaria'
    )
  );

CREATE POLICY "Secretaria can update students"
  ON public.students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretaria'
    )
  );

CREATE POLICY "Secretaria can delete students"
  ON public.students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'secretaria'
    )
  );

-- Students can view their own record
CREATE POLICY "Students can view their own record"
  ON public.students FOR SELECT
  USING (user_id = auth.uid());

-- Coordenacao and Diretor can view all students
CREATE POLICY "Coordenacao can view all students"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('coordenacao', 'diretor')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();