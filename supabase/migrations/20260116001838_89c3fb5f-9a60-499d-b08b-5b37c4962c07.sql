-- Update role_from_email function to include regional
CREATE OR REPLACE FUNCTION public.role_from_email(_email text)
 RETURNS app_role
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE lower(coalesce(_email, ''))
    WHEN 'aluno@gmail.com' THEN 'aluno'::public.app_role
    WHEN 'professor@gmail.com' THEN 'professor'::public.app_role
    WHEN 'coordenacao@gmail.com' THEN 'coordenacao'::public.app_role
    WHEN 'diretor@gmail.com' THEN 'diretor'::public.app_role
    WHEN 'secretaria@gmail.com' THEN 'secretaria'::public.app_role
    WHEN 'regional@gmail.com' THEN 'regional'::public.app_role
    ELSE NULL
  END
$function$;