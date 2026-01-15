-- Create boletos table
CREATE TABLE public.boletos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.boletos ENABLE ROW LEVEL SECURITY;

-- Secretaria can manage boletos
CREATE POLICY "Secretaria can manage boletos"
ON public.boletos
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'secretaria'::app_role
));

-- Coordenacao and Diretor can view all boletos
CREATE POLICY "Coordenacao and Diretor can view boletos"
ON public.boletos
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = ANY (ARRAY['coordenacao'::app_role, 'diretor'::app_role])
));

-- Students can view their own boletos
CREATE POLICY "Students can view their own boletos"
ON public.boletos
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM students s
  WHERE s.id = boletos.student_id
  AND s.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_boletos_updated_at
BEFORE UPDATE ON public.boletos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();