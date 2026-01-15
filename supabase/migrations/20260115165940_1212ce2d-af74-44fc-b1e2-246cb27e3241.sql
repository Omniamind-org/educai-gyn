-- Drop existing problematic policies on students table
DROP POLICY IF EXISTS "Secretaria can manage all students" ON public.students;
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;

-- Drop existing problematic policies on class_students table
DROP POLICY IF EXISTS "Secretaria can manage class_students" ON public.class_students;
DROP POLICY IF EXISTS "Teachers can view their class students" ON public.class_students;
DROP POLICY IF EXISTS "Students can view their own class enrollments" ON public.class_students;

-- Recreate simple policies for students table without recursion
CREATE POLICY "Secretaria can manage all students" 
ON public.students 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'secretaria'
  )
);

CREATE POLICY "Students can view own record" 
ON public.students 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Teachers can view all students" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'professor'
  )
);

-- Recreate simple policies for class_students table without recursion
CREATE POLICY "Secretaria can manage class_students" 
ON public.class_students 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'secretaria'
  )
);

CREATE POLICY "Teachers can view class_students" 
ON public.class_students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'professor'
  )
);

CREATE POLICY "Students can view own enrollments" 
ON public.class_students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE students.id = class_students.student_id 
    AND students.user_id = auth.uid()
  )
);