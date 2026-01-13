import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random password
function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Format CPF to remove special characters for email
function cpfToEmail(cpf: string): string {
  const cleanCpf = cpf.replace(/\D/g, "");
  return `${cleanCpf}@aluno.aprendu.internal`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify they're secretaria
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is secretaria
    const { data: roleData, error: roleError } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "secretaria") {
      return new Response(
        JSON.stringify({ error: "Apenas a secretaria pode cadastrar alunos" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { name, cpf, phone, grade } = await req.json();

    if (!name || !cpf || !grade) {
      return new Response(
        JSON.stringify({ error: "Nome, CPF e série são obrigatórios" }),
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

    // Generate password
    const password = generatePassword(8);
    const email = cpfToEmail(cpf);

    // Use service role to create auth user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if student already exists
    const { data: existingStudent } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("cpf", cleanCpf)
      .maybeSingle();

    if (existingStudent) {
      return new Response(
        JSON.stringify({ error: "Já existe um aluno cadastrado com este CPF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, cpf: cleanCpf },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create student record with password stored
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        user_id: authData.user.id,
        cpf: cleanCpf,
        name,
        phone: phone || null,
        grade,
        status: "ativo",
        password, // Store the generated password
      })
      .select()
      .single();

    if (studentError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: `Erro ao criar registro do aluno: ${studentError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user_role for student
    await supabaseAdmin.from("user_roles").insert({
      user_id: authData.user.id,
      role: "aluno",
    });

    return new Response(
      JSON.stringify({
        success: true,
        student: {
          id: studentData.id,
          name: studentData.name,
          cpf: cleanCpf,
          grade: studentData.grade,
          status: studentData.status,
          created_at: studentData.created_at,
        },
        credentials: {
          cpf: cleanCpf,
          password,
        },
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
