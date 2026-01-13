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
        JSON.stringify({ error: "Apenas a secretaria pode ver senhas de professores" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { teacherId } = await req.json();

    if (!teacherId) {
      return new Response(
        JSON.stringify({ error: "ID do professor é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to get teacher data
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .select("*")
      .eq("id", teacherId)
      .maybeSingle();

    if (teacherError || !teacher) {
      return new Response(
        JSON.stringify({ error: "Professor não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let password = teacher.password;

    // If password is null (legacy teacher), generate a new one
    if (!password) {
      password = generatePassword(8);

      // Update password in auth if user_id exists
      if (teacher.user_id) {
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          teacher.user_id,
          { password }
        );

        if (authUpdateError) {
          console.error("Error updating auth password:", authUpdateError);
          return new Response(
            JSON.stringify({ error: "Erro ao atualizar senha na autenticação" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Update password in teachers table
      const { error: updateError } = await supabaseAdmin
        .from("teachers")
        .update({ password })
        .eq("id", teacherId);

      if (updateError) {
        console.error("Error updating teacher password:", updateError);
        return new Response(
          JSON.stringify({ error: "Erro ao salvar nova senha" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Generated new password for teacher: ${teacher.name}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        teacherName: teacher.name,
        cpf: teacher.cpf,
        password,
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
