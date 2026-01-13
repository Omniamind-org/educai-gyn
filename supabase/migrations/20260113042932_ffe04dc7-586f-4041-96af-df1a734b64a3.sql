-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  phone TEXT,
  subject TEXT,
  password TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Secretaria can view all teachers"
ON public.teachers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'secretaria'
));

CREATE POLICY "Secretaria can insert teachers"
ON public.teachers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'secretaria'
));

CREATE POLICY "Secretaria can update teachers"
ON public.teachers FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'secretaria'
));

CREATE POLICY "Secretaria can delete teachers"
ON public.teachers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'secretaria'
));

CREATE POLICY "Teachers can view their own record"
ON public.teachers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Coordenacao and Diretor can view all teachers"
ON public.teachers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role IN ('coordenacao', 'diretor')
));

-- Trigger for updated_at
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();