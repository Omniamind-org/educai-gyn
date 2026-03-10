import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";
import { getUser } from "../_shared/auth.ts";
import { extractPdfTextFromBuffer } from "../_shared/pdf.ts";

interface StudentCopilotAttachment {
  name: string;
  path: string;
  mimeType?: string;
  size?: number;
}

interface SubmitStudentTaskDraft {
  taskId: string;
  studentMessage?: string;
  confidence?: number;
  attachment?: StudentCopilotAttachment;
}

interface SubmitStudentTaskRequest {
  draft?: SubmitStudentTaskDraft;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await getUser(req);

    if (!user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Backend auth is not configured" }, 503);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = (await req.json()) as SubmitStudentTaskRequest;
    const draft = body?.draft;

    if (!draft?.taskId || typeof draft.taskId !== "string") {
      return jsonResponse({ error: "taskId is required" }, 400);
    }

    if (!draft.attachment?.path && !draft.studentMessage?.trim()) {
      return jsonResponse(
        { error: "A submissão precisa de um PDF ou de um texto do aluno" },
        400,
      );
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, name")
      .eq("user_id", user.id)
      .single();

    if (studentError || !student) {
      return jsonResponse({ error: "Aluno não encontrado" }, 403);
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, class_id, status")
      .eq("id", draft.taskId)
      .single();

    if (taskError || !task) {
      return jsonResponse({ error: "Tarefa não encontrada" }, 404);
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("class_students")
      .select("class_id")
      .eq("student_id", student.id)
      .eq("class_id", task.class_id)
      .maybeSingle();

    if (enrollmentError || !enrollment) {
      return jsonResponse({ error: "Você não tem acesso a esta tarefa" }, 403);
    }

    let extractedText: string | null = null;
    let originalFilePath: string | null = null;
    let originalFileName: string | null = null;

    if (draft.attachment?.path) {
      if (!draft.attachment.path.startsWith(`${user.id}/`)) {
        return jsonResponse({ error: "Arquivo inválido para este usuário" }, 403);
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from("student-submissions")
        .download(draft.attachment.path);

      if (fileError || !fileData) {
        return jsonResponse({ error: "Não foi possível acessar o PDF anexado" }, 400);
      }

      const buffer = await fileData.arrayBuffer();
      const extracted = await extractPdfTextFromBuffer(buffer);

      extractedText = extracted.text || null;
      originalFilePath = draft.attachment.path;
      originalFileName = draft.attachment.name;
    }

    const submittedAt = new Date().toISOString();

    const { data: submission, error: submissionError } = await supabase
      .from("task_submissions")
      .upsert(
        {
          task_id: task.id,
          student_id: student.id,
          original_file_path: originalFilePath,
          original_file_name: originalFileName,
          student_message: draft.studentMessage?.trim() || null,
          extracted_text: extractedText,
          confidence:
            typeof draft.confidence === "number" ? draft.confidence : 0,
          status: "submitted",
          created_by_agent: true,
          submitted_at: submittedAt,
        },
        { onConflict: "task_id,student_id" },
      )
      .select("id, submitted_at")
      .single();

    if (submissionError || !submission) {
      console.error("submit-student-task submissionError", submissionError);
      return jsonResponse({ error: "Não foi possível salvar a submissão" }, 500);
    }

    const { data: existingGrade, error: existingGradeError } = await supabase
      .from("student_grades")
      .select("id")
      .eq("task_id", task.id)
      .eq("student_id", student.id)
      .maybeSingle();

    if (existingGradeError) {
      console.error("submit-student-task existingGradeError", existingGradeError);
      return jsonResponse({ error: "Não foi possível sincronizar a entrega" }, 500);
    }

    if (existingGrade?.id) {
      const { error: updateGradeError } = await supabase
        .from("student_grades")
        .update({ submitted_at: submittedAt })
        .eq("id", existingGrade.id);

      if (updateGradeError) {
        console.error("submit-student-task updateGradeError", updateGradeError);
        return jsonResponse({ error: "Não foi possível sincronizar a entrega" }, 500);
      }
    } else {
      const { error: insertGradeError } = await supabase
        .from("student_grades")
        .insert({
          task_id: task.id,
          student_id: student.id,
          submitted_at: submittedAt,
        });

      if (insertGradeError) {
        console.error("submit-student-task insertGradeError", insertGradeError);
        return jsonResponse({ error: "Não foi possível sincronizar a entrega" }, 500);
      }
    }

    return jsonResponse({
      message: `Entreguei "${task.title}" com sucesso. Agora o professor poderá revisar a sua atividade.`,
      deliveryResult: {
        submissionId: submission.id,
        taskId: task.id,
        submittedAt: submission.submitted_at,
        status: "submitted",
      },
    });
  } catch (error) {
    console.error("submit-student-task error", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
