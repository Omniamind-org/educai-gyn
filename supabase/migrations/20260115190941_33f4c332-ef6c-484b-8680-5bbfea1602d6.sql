-- Create disciplines table
CREATE TABLE public.disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create teacher_disciplines junction table
CREATE TABLE public.teacher_disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  discipline_id uuid NOT NULL REFERENCES public.disciplines(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, discipline_id)
);

-- Add discipline_id to tasks table
ALTER TABLE public.tasks ADD COLUMN discipline_id uuid REFERENCES public.disciplines(id);

-- Enable RLS
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_disciplines ENABLE ROW LEVEL SECURITY;

-- Disciplines policies
CREATE POLICY "Secretaria can manage disciplines"
ON public.disciplines FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'secretaria'
));

CREATE POLICY "Everyone can view disciplines"
ON public.disciplines FOR SELECT
USING (true);

-- Teacher disciplines policies
CREATE POLICY "Secretaria can manage teacher_disciplines"
ON public.teacher_disciplines FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'secretaria'
));

CREATE POLICY "Everyone can view teacher_disciplines"
ON public.teacher_disciplines FOR SELECT
USING (true);

-- Update trigger for disciplines
CREATE TRIGGER update_disciplines_updated_at
BEFORE UPDATE ON public.disciplines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();