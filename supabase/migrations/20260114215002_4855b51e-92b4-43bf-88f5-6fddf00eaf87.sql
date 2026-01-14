-- Create tasks table for teacher assignments
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score NUMERIC NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_grades table
CREATE TABLE public.student_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  score NUMERIC,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  graded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, student_id)
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks

-- Teachers can view tasks for their classes
CREATE POLICY "Teachers can view their class tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN teachers t ON t.id = ct.teacher_id
    WHERE ct.class_id = tasks.class_id AND t.user_id = auth.uid()
  )
);

-- Teachers can insert tasks for their classes
CREATE POLICY "Teachers can create tasks for their classes"
ON public.tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN teachers t ON t.id = ct.teacher_id
    WHERE ct.class_id = tasks.class_id AND t.user_id = auth.uid()
  )
);

-- Teachers can update their own tasks
CREATE POLICY "Teachers can update their tasks"
ON public.tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.id = tasks.teacher_id AND t.user_id = auth.uid()
  )
);

-- Teachers can delete their own tasks
CREATE POLICY "Teachers can delete their tasks"
ON public.tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.id = tasks.teacher_id AND t.user_id = auth.uid()
  )
);

-- Coordenacao and Diretor can view all tasks
CREATE POLICY "Coordenacao and Diretor can view all tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND role IN ('coordenacao', 'diretor')
  )
);

-- RLS Policies for student_grades

-- Teachers can view grades for students in their classes
CREATE POLICY "Teachers can view student grades in their classes"
ON public.student_grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN class_teachers ct ON ct.class_id = t.class_id
    JOIN teachers te ON te.id = ct.teacher_id
    WHERE t.id = student_grades.task_id AND te.user_id = auth.uid()
  )
);

-- Teachers can insert grades for students in their classes
CREATE POLICY "Teachers can insert student grades"
ON public.student_grades FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN class_teachers ct ON ct.class_id = t.class_id
    JOIN teachers te ON te.id = ct.teacher_id
    WHERE t.id = student_grades.task_id AND te.user_id = auth.uid()
  )
);

-- Teachers can update grades for students in their classes
CREATE POLICY "Teachers can update student grades"
ON public.student_grades FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN class_teachers ct ON ct.class_id = t.class_id
    JOIN teachers te ON te.id = ct.teacher_id
    WHERE t.id = student_grades.task_id AND te.user_id = auth.uid()
  )
);

-- Students can view their own grades
CREATE POLICY "Students can view their own grades"
ON public.student_grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_grades.student_id AND s.user_id = auth.uid()
  )
);

-- Coordenacao and Diretor can view all grades
CREATE POLICY "Coordenacao and Diretor can view all grades"
ON public.student_grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND role IN ('coordenacao', 'diretor')
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_grades_updated_at
BEFORE UPDATE ON public.student_grades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();