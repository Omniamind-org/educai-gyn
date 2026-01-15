-- Allow students to view tasks from their classes
CREATE POLICY "Students can view tasks from their classes"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = tasks.class_id
    AND s.user_id = auth.uid()
  )
);

-- Allow students to view their class enrollments
CREATE POLICY "Students can view their own class enrollments"
ON public.class_students FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM students s
    WHERE s.id = class_students.student_id
    AND s.user_id = auth.uid()
  )
);