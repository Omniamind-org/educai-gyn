import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Convert CPF to internal email format for teachers
function cpfToEmail(cpf: string): string {
  const cleanCpf = cpf.replace(/\D/g, "");
  return `${cleanCpf}@professor.aprendu.internal`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cpf, password } = await req.json();

    if (!cpf || !password) {
      return new Response(
        JSON.stringify({ error: "CPF e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean CPF
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      return new Response(
        JSON.stringify({ error: "CPF inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Convert CPF to email
    const email = cpfToEmail(cleanCpf);

    // Create client and attempt login
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Login failed for teacher:", cleanCpf);
      return new Response(
        JSON.stringify({ error: "CPF ou senha incorretos" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Teacher logged in:", cleanCpf);

    return new Response(
      JSON.stringify({
        success: true,
        session: data.session,
        user: data.user,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: `Erro interno: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
