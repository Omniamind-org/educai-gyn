-- Add school_id to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;

-- Policy update (ensure users can read their own profile's school_id)
-- Assuming policies already exist for profiles, but ensuring RLS allows reading this new column.

-- EXAMPLE SEED (For User Testing)
-- UPDATE public.profiles SET school_id = '<SCHOOL_UUID>' WHERE id = '<USER_UUID>';
