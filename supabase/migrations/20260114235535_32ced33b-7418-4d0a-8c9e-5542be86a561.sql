-- Create lesson_plans table to store generated lesson plans
CREATE TABLE public.lesson_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  series TEXT,
  bncc_objective TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher access
CREATE POLICY "Teachers can view their own lesson plans" 
ON public.lesson_plans 
FOR SELECT 
USING (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can create their own lesson plans" 
ON public.lesson_plans 
FOR INSERT 
WITH CHECK (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update their own lesson plans" 
ON public.lesson_plans 
FOR UPDATE 
USING (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete their own lesson plans" 
ON public.lesson_plans 
FOR DELETE 
USING (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lesson_plans_updated_at
BEFORE UPDATE ON public.lesson_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();