import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a new random password
function generatePassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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
        JSON.stringify({ error: "Apenas a secretaria pode ver senhas de alunos" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { studentId } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "ID do aluno é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to get/update student password
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get student
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("user_id, cpf, name, password")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Aluno não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let password = student.password;

    // If no password stored (legacy student), generate one and save it
    if (!password) {
      password = generatePassword(8);

      // Update password in auth
      if (student.user_id) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          student.user_id,
          { password }
        );

        if (authError) {
          console.error("Error updating auth password:", authError);
          return new Response(
            JSON.stringify({ error: `Erro ao atualizar senha: ${authError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Save password to students table
      const { error: updateError } = await supabaseAdmin
        .from("students")
        .update({ password })
        .eq("id", studentId);

      if (updateError) {
        console.error("Error saving password to students table:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        studentName: student.name,
        cpf: student.cpf,
        password,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error in get-student-password:", message);
    return new Response(
      JSON.stringify({ error: `Erro interno: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
