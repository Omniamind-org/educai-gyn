-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Add attachment_url column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Storage policies for task-attachments bucket

-- Teachers can upload files
CREATE POLICY "Teachers can upload task attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments'
  AND EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.user_id = auth.uid()
  )
);

-- Teachers can update their uploads
CREATE POLICY "Teachers can update task attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'task-attachments'
  AND EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.user_id = auth.uid()
  )
);

-- Teachers can delete their uploads
CREATE POLICY "Teachers can delete task attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-attachments'
  AND EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.user_id = auth.uid()
  )
);

-- Everyone authenticated can read/download (public bucket)
CREATE POLICY "Authenticated users can read task attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-attachments'
  AND auth.role() = 'authenticated'
);
