-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create class_students junction table
CREATE TABLE public.class_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Create class_teachers junction table
CREATE TABLE public.class_teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, teacher_id)
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;

-- RLS for classes table
CREATE POLICY "Secretaria can manage classes" ON public.classes
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'secretaria')
);

CREATE POLICY "Teachers can view their classes" ON public.classes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN teachers t ON t.id = ct.teacher_id
    WHERE ct.class_id = classes.id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Coordenacao and Diretor can view all classes" ON public.classes
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['coordenacao'::app_role, 'diretor'::app_role]))
);

-- RLS for class_students table
CREATE POLICY "Secretaria can manage class_students" ON public.class_students
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'secretaria')
);

CREATE POLICY "Teachers can view students in their classes" ON public.class_students
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM class_teachers ct
    JOIN teachers t ON t.id = ct.teacher_id
    WHERE ct.class_id = class_students.class_id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Coordenacao and Diretor can view all class_students" ON public.class_students
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['coordenacao'::app_role, 'diretor'::app_role]))
);

-- RLS for class_teachers table
CREATE POLICY "Secretaria can manage class_teachers" ON public.class_teachers
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'secretaria')
);

CREATE POLICY "Teachers can view their own assignments" ON public.class_teachers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.id = class_teachers.teacher_id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Coordenacao and Diretor can view all class_teachers" ON public.class_teachers
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['coordenacao'::app_role, 'diretor'::app_role]))
);

-- Create triggers for updated_at
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();