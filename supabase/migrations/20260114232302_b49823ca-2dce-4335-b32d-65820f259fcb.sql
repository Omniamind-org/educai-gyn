-- Allow teachers to view students that are in classes they teach
CREATE POLICY "Teachers can view students in their classes" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN class_teachers ct ON ct.class_id = cs.class_id
    JOIN teachers t ON t.id = ct.teacher_id
    WHERE cs.student_id = students.id 
    AND t.user_id = auth.uid()
  )
);

-- Allow teachers to view class_students records for their classes
CREATE POLICY "Teachers can view class_students for their classes" 
ON public.class_students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM class_teachers ct
    JOIN teachers t ON t.id = ct.teacher_id
    WHERE ct.class_id = class_students.class_id 
    AND t.user_id = auth.uid()
  )
);