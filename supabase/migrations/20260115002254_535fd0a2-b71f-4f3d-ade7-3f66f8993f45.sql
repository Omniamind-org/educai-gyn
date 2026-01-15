-- Create table for exercise lists
CREATE TABLE public.exercise_lists (
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
ALTER TABLE public.exercise_lists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (same pattern as lesson_plans)
CREATE POLICY "Teachers can view their own exercise lists" 
ON public.exercise_lists 
FOR SELECT 
USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can create their own exercise lists" 
ON public.exercise_lists 
FOR INSERT 
WITH CHECK (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can update their own exercise lists" 
ON public.exercise_lists 
FOR UPDATE 
USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can delete their own exercise lists" 
ON public.exercise_lists 
FOR DELETE 
USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_exercise_lists_updated_at
BEFORE UPDATE ON public.exercise_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();