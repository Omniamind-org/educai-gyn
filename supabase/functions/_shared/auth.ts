import { createClient, User } from "https://esm.sh/@supabase/supabase-js@2";

export async function getUser(req: Request): Promise<User | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";

  if (!token) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) return null;
  return user;
}
