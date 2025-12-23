-- Stop modifying auth schema: remove signup trigger if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Map role from email (for safe self-assignment only for known test accounts)
CREATE OR REPLACE FUNCTION public.role_from_email(_email TEXT)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE lower(coalesce(_email, ''))
    WHEN 'aluno@gmail.com' THEN 'aluno'::public.app_role
    WHEN 'professor@gmail.com' THEN 'professor'::public.app_role
    WHEN 'coordenacao@gmail.com' THEN 'coordenacao'::public.app_role
    WHEN 'diretor@gmail.com' THEN 'diretor'::public.app_role
    ELSE 'aluno'::public.app_role
  END
$$;

-- Allow users to insert ONLY their own role and only the role mapped from their JWT email
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = public.role_from_email((auth.jwt() ->> 'email'))
);
