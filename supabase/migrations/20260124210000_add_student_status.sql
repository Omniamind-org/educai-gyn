-- Add status column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'dropout'));

-- Policy Update: Ensure Teachers/Directors can update students
-- (Assuming existing RLS might block updates, we ensure a policy exists)
CREATE POLICY "Allow teachers to update student status" ON public.students
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.class_students cs
        JOIN public.class_teachers ct ON ct.class_id = cs.class_id
        WHERE cs.student_id = students.id
        AND ct.teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Allow directors to update student status" ON public.students
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.schools s
        WHERE s.id = students.school_id
        AND s.director_id = auth.uid()
    )
);
