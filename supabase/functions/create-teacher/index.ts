import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random password
function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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
    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user has secretaria role
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check role
    const { data: roleData } = await supabaseAuth
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!roleData || roleData.role !== "secretaria") {
      return new Response(
        JSON.stringify({ error: "Apenas a secretaria pode cadastrar professores" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { name, cpf, phone, discipline_ids } = await req.json();

    if (!name || !cpf) {
      return new Response(
        JSON.stringify({ error: "Nome e CPF são obrigatórios" }),
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

    // Generate password and email
    const password = generatePassword(8);
    const email = cpfToEmail(cleanCpf);

    // Use service role to create auth user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if teacher already exists
    const { data: existingTeacher } = await supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("cpf", cleanCpf)
      .maybeSingle();

    if (existingTeacher) {
      return new Response(
        JSON.stringify({ error: "Já existe um professor com este CPF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: "professor" },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert teacher record
    const { data: teacherData, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .insert({
        user_id: authUser.user.id,
        name,
        cpf: cleanCpf,
        phone: phone || null,
        password,
        status: "ativo",
      })
      .select()
      .single();

    if (teacherError) {
      console.error("Teacher insert error:", teacherError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return new Response(
        JSON.stringify({ error: `Erro ao criar registro do professor: ${teacherError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user_roles entry
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: "professor",
      });

    if (roleError) {
      console.error("Role insert error:", roleError);
      // Continue anyway - teacher was created
    }

    // Insert teacher_disciplines if any
    if (discipline_ids && Array.isArray(discipline_ids) && discipline_ids.length > 0) {
      const disciplineInserts = discipline_ids.map((disciplineId: string) => ({
        teacher_id: teacherData.id,
        discipline_id: disciplineId,
      }));

      const { error: discError } = await supabaseAdmin
        .from("teacher_disciplines")
        .insert(disciplineInserts);

      if (discError) {
        console.error("Discipline insert error:", discError);
        // Continue anyway - teacher was created
      }
    }

    console.log(`Teacher created: ${name} (${cleanCpf})`);

    return new Response(
      JSON.stringify({
        success: true,
        teacher: teacherData,
        credentials: {
          cpf: cleanCpf,
          password,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: `Erro interno: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
