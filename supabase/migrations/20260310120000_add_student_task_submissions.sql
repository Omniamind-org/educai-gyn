CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  original_file_path TEXT,
  original_file_name TEXT,
  student_message TEXT,
  extracted_text TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('pending_confirmation', 'submitted', 'cancelled')
  ),
  created_by_agent BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id
  ON public.task_submissions(task_id);

CREATE INDEX IF NOT EXISTS idx_task_submissions_student_id
  ON public.task_submissions(student_id);

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own task submissions"
ON public.task_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    WHERE s.id = task_submissions.student_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Students can create their own task submissions"
ON public.task_submissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.class_students cs ON cs.student_id = s.id
    JOIN public.tasks t ON t.class_id = cs.class_id
    WHERE s.id = task_submissions.student_id
      AND s.user_id = auth.uid()
      AND t.id = task_submissions.task_id
  )
);

CREATE POLICY "Students can update their own task submissions"
ON public.task_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.students s
    WHERE s.id = task_submissions.student_id
      AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.class_students cs ON cs.student_id = s.id
    JOIN public.tasks t ON t.class_id = cs.class_id
    WHERE s.id = task_submissions.student_id
      AND s.user_id = auth.uid()
      AND t.id = task_submissions.task_id
  )
);

CREATE POLICY "Teachers can view submissions for their classes"
ON public.task_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.tasks t
    JOIN public.class_teachers ct ON ct.class_id = t.class_id
    JOIN public.teachers te ON te.id = ct.teacher_id
    WHERE t.id = task_submissions.task_id
      AND te.user_id = auth.uid()
  )
);

CREATE POLICY "Coordenacao and Diretor can view all task submissions"
ON public.task_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND role IN ('coordenacao', 'diretor')
  )
);

CREATE TRIGGER update_task_submissions_updated_at
BEFORE UPDATE ON public.task_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-submissions',
  'student-submissions',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Students can upload their submission PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-submissions'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1
    FROM public.students s
    WHERE s.user_id = auth.uid()
  )
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Students can view their submission PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-submissions'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Students can update their submission PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-submissions'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'student-submissions'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Students can delete their submission PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-submissions'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
