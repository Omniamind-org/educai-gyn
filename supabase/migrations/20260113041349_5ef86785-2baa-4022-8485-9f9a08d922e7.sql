-- Add password column to students table to store the generated password
ALTER TABLE public.students ADD COLUMN password text;