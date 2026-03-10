import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";
import { getUser } from "../_shared/auth.ts";
import { extractPdfTextFromBuffer } from "../_shared/pdf.ts";

const MAX_MESSAGES_COUNT = 50;
const MAX_MESSAGE_LENGTH = 4000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StudentCopilotAttachment {
  name: string;
  path: string;
  mimeType: string;
  size: number;
}

interface StudentCopilotContext {
  selectedTaskId?: string;
  attachment?: StudentCopilotAttachment;
}

interface StudentTaskContextItem {
  taskId: string;
  title: string;
  description: string | null;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  disciplineId: string | null;
  disciplineName: string | null;
  dueDate: string | null;
  maxScore: number;
  type: string | null;
  attachmentUrl: string | null;
  alreadySubmitted: boolean;
}

interface StudentCopilotResponse {
  intent:
    | "GENERAL_SUPPORT"
    | "TASK_DELIVERY"
    | "TASK_SELECTION"
    | "TASK_CONFIRMED"
    | "ERROR";
  decision:
    | "NO_ACTION"
    | "REQUEST_TASK_SELECTION"
    | "REQUEST_CONFIRMATION"
    | "DELIVERY_COMPLETE";
  message: string;
  extractedTextSnippet?: string;
  candidateTasks?: Array<{
    taskId: string;
    title: string;
    classId: string;
    className: string;
    teacherId: string;
    teacherName: string;
    disciplineId: string | null;
    disciplineName: string | null;
    dueDate: string | null;
    confidence: number;
    reason: string;
  }>;
  submissionDraft?: {
    taskId: string;
    title: string;
    classId: string;
    className: string;
    teacherId: string;
    teacherName: string;
    disciplineId: string | null;
    disciplineName: string | null;
    dueDate: string | null;
    confidence: number;
    requiresConfirmation: boolean;
    source: "text" | "pdf" | "pdf_and_text";
    studentMessage?: string;
    extractedTextSnippet?: string;
  };
  notes?: string[];
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createOpenAIStyleSseResponse(content: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const chunkSize = 600;

      for (let index = 0; index < content.length; index += chunkSize) {
        const piece = content.slice(index, index + chunkSize);
        const payload = JSON.stringify({
          choices: [{ delta: { content: piece } }],
        });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

function validateMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  if (messages.length === 0 || messages.length > MAX_MESSAGES_COUNT) {
    throw new Error(`Messages must contain between 1 and ${MAX_MESSAGES_COUNT} items`);
  }

  return messages.map((message, index) => {
    if (typeof message !== "object" || message === null) {
      throw new Error(`Message at index ${index} must be an object`);
    }

    const { role, content } = message as Record<string, unknown>;

    if (role !== "user" && role !== "assistant") {
      throw new Error(`Invalid role at index ${index}`);
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error(`Invalid content at index ${index}`);
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message at index ${index} exceeds ${MAX_MESSAGE_LENGTH} characters`,
      );
    }

    return { role, content: content.trim() };
  });
}

function validateContext(context: unknown): StudentCopilotContext {
  if (!context || typeof context !== "object") {
    return {};
  }

  const value = context as Record<string, unknown>;
  const validated: StudentCopilotContext = {};

  if (typeof value.selectedTaskId === "string" && value.selectedTaskId.trim()) {
    validated.selectedTaskId = value.selectedTaskId.trim();
  }

  if (value.attachment && typeof value.attachment === "object") {
    const attachment = value.attachment as Record<string, unknown>;
    if (
      typeof attachment.name === "string" &&
      typeof attachment.path === "string" &&
      typeof attachment.mimeType === "string" &&
      typeof attachment.size === "number"
    ) {
      validated.attachment = {
        name: attachment.name.trim(),
        path: attachment.path.trim(),
        mimeType: attachment.mimeType.trim(),
        size: attachment.size,
      };
    }
  }

  return validated;
}

function buildSupportPrompt(args: {
  studentName: string;
  grade: string;
  tasks: StudentTaskContextItem[];
  selectedTask: StudentTaskContextItem | null;
  latestUserMessage: string;
  extractedText: string;
  extractedTextSnippet: string;
}) {
  const tasksJson = JSON.stringify(args.tasks, null, 2);
  const selectedTaskJson = args.selectedTask
    ? JSON.stringify(args.selectedTask, null, 2)
    : "null";

  return `Você é o Student Copilot da plataforma educacional Aprendu.

Sua função é conversar bem com o aluno e, quando fizer sentido, preparar uma entrega de atividade para confirmação.

REGRAS OBRIGATÓRIAS:
- Responda SEMPRE e APENAS com JSON válido.
- Nunca entregue a atividade automaticamente. Quando detectar uma entrega possível, retorne REQUEST_CONFIRMATION.
- Se houver mais de uma tarefa plausível, retorne REQUEST_TASK_SELECTION com 2 a 4 candidateTasks.
- Se a pergunta não for sobre entrega, tire a dúvida normalmente e use decision = NO_ACTION.
- Se houver selectedTaskId no contexto, use essa tarefa como prioridade absoluta.
- Use apenas taskId existentes em TASKS_ATIVAS.
- confidence deve ser um número entre 0 e 1.
- extractedTextSnippet deve ser curto, útil e sem inventar conteúdo.
- Se a tarefa já estiver submetida, você pode preparar uma nova confirmação, mas deixe isso claro na message.
- Nunca use markdown, nunca use blocos de código.

FORMATO EXATO DE SAÍDA:
{
  "intent": "GENERAL_SUPPORT" | "TASK_DELIVERY" | "TASK_SELECTION" | "TASK_CONFIRMED" | "ERROR",
  "decision": "NO_ACTION" | "REQUEST_TASK_SELECTION" | "REQUEST_CONFIRMATION" | "DELIVERY_COMPLETE",
  "message": "mensagem curta em português",
  "extractedTextSnippet": "opcional",
  "candidateTasks": [
    {
      "taskId": "uuid",
      "title": "nome da tarefa",
      "classId": "uuid",
      "className": "nome da turma",
      "teacherId": "uuid",
      "teacherName": "nome do professor",
      "disciplineId": "uuid ou null",
      "disciplineName": "nome da disciplina ou null",
      "dueDate": "ISO ou null",
      "confidence": 0.0,
      "reason": "motivo curto"
    }
  ],
  "submissionDraft": {
    "taskId": "uuid",
    "title": "nome da tarefa",
    "classId": "uuid",
    "className": "nome da turma",
    "teacherId": "uuid",
    "teacherName": "nome do professor",
    "disciplineId": "uuid ou null",
    "disciplineName": "nome da disciplina ou null",
    "dueDate": "ISO ou null",
    "confidence": 0.0,
    "requiresConfirmation": true,
    "source": "text" | "pdf" | "pdf_and_text",
    "studentMessage": "opcional",
    "extractedTextSnippet": "opcional"
  },
  "notes": ["opcional"]
}

EXEMPLO 1:
{
  "intent": "TASK_DELIVERY",
  "decision": "REQUEST_CONFIRMATION",
  "message": "Identifiquei a tarefa e preparei a entrega para sua confirmação.",
  "extractedTextSnippet": "Resumo curto do PDF.",
  "submissionDraft": {
    "taskId": "uuid-da-tarefa",
    "title": "Lista de Matemática",
    "classId": "uuid-da-turma",
    "className": "8º Ano A",
    "teacherId": "uuid-do-professor",
    "teacherName": "Maria Souza",
    "disciplineId": "uuid-da-disciplina",
    "disciplineName": "Matemática",
    "dueDate": "2026-03-15T03:00:00.000Z",
    "confidence": 0.94,
    "requiresConfirmation": true,
    "source": "pdf_and_text",
    "studentMessage": "Quero entregar essa atividade",
    "extractedTextSnippet": "Resumo curto do PDF."
  }
}

EXEMPLO 2:
{
  "intent": "TASK_SELECTION",
  "decision": "REQUEST_TASK_SELECTION",
  "message": "Encontrei mais de uma tarefa possível. Escolha qual delas você quer entregar.",
  "candidateTasks": [
    {
      "taskId": "uuid-1",
      "title": "Relatório de Ciências",
      "classId": "class-1",
      "className": "7º Ano B",
      "teacherId": "teacher-1",
      "teacherName": "João Silva",
      "disciplineId": "disc-1",
      "disciplineName": "Ciências",
      "dueDate": "2026-03-18T03:00:00.000Z",
      "confidence": 0.74,
      "reason": "O PDF menciona ecossistemas e o título da atividade combina."
    }
  ]
}

DADOS REAIS DO ALUNO:
- Nome: ${args.studentName}
- Série: ${args.grade}
- Mensagem mais recente do aluno: ${args.latestUserMessage}

TAREFA SELECIONADA PELO FRONTEND:
${selectedTaskJson}

TAREFAS_ATIVAS:
${tasksJson}

TEXTO EXTRAÍDO DO PDF:
${args.extractedText || "Nenhum PDF anexado nesta mensagem."}

TRECHO CURTO DO PDF:
${args.extractedTextSnippet || "Nenhum PDF anexado nesta mensagem."}`;
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

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Backend auth is not configured" }, 503);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const messages = validateMessages(body.messages);
    const context = validateContext(body.context);

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, name, grade")
      .eq("user_id", user.id)
      .single();

    if (studentError || !student) {
      return createOpenAIStyleSseResponse(
        JSON.stringify({
          intent: "ERROR",
          decision: "NO_ACTION",
          message: "Não consegui identificar seu perfil de aluno nesta conta.",
        } satisfies StudentCopilotResponse),
      );
    }

    const { data: classEnrollments, error: enrollmentError } = await supabase
      .from("class_students")
      .select("class_id")
      .eq("student_id", student.id);

    if (enrollmentError) {
      console.error("student-copilot enrollmentError", enrollmentError);
      return jsonResponse({ error: "Não foi possível carregar as turmas do aluno" }, 500);
    }

    const classIds = (classEnrollments || []).map((item) => item.class_id);

    if (classIds.length === 0) {
      return createOpenAIStyleSseResponse(
        JSON.stringify({
          intent: "GENERAL_SUPPORT",
          decision: "NO_ACTION",
          message: "Não encontrei turmas ativas vinculadas ao seu perfil no momento.",
        } satisfies StudentCopilotResponse),
      );
    }

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        due_date,
        max_score,
        class_id,
        teacher_id,
        discipline_id,
        type,
        status,
        attachment_url
      `)
      .in("class_id", classIds)
      .eq("status", "ativa")
      .order("due_date", { ascending: true });

    if (tasksError) {
      console.error("student-copilot tasksError", tasksError);
      return jsonResponse({ error: "Não foi possível carregar as tarefas do aluno" }, 500);
    }

    const teacherIds = [
      ...new Set((tasksData || []).map((task) => task.teacher_id)),
    ];
    const disciplineIds = [
      ...new Set(
        (tasksData || [])
          .map((task) => task.discipline_id)
          .filter((disciplineId): disciplineId is string => Boolean(disciplineId)),
      ),
    ];

    const [{ data: classesData }, { data: teachersData }, { data: disciplinesData }] =
      await Promise.all([
        supabase.from("classes").select("id, name").in("id", classIds),
        teacherIds.length > 0
          ? supabase.from("teachers").select("id, name").in("id", teacherIds)
          : Promise.resolve({ data: [], error: null }),
        disciplineIds.length > 0
          ? supabase
              .from("disciplines")
              .select("id, name")
              .in("id", disciplineIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

    const taskIds = (tasksData || []).map((task) => task.id);
    const { data: gradesData } = taskIds.length > 0
      ? await supabase
          .from("student_grades")
          .select("task_id, submitted_at")
          .eq("student_id", student.id)
          .in("task_id", taskIds)
      : { data: [], error: null };

    const classMap = new Map((classesData || []).map((item) => [item.id, item.name]));
    const teacherMap = new Map((teachersData || []).map((item) => [item.id, item.name]));
    const disciplineMap = new Map(
      (disciplinesData || []).map((item) => [item.id, item.name]),
    );
    const gradeMap = new Map(
      (gradesData || []).map((item) => [item.task_id, item.submitted_at]),
    );

    const taskContextItems: StudentTaskContextItem[] = (tasksData || []).map((task) => ({
      taskId: task.id,
      title: task.title,
      description: task.description,
      classId: task.class_id,
      className: classMap.get(task.class_id) || "Turma",
      teacherId: task.teacher_id,
      teacherName: teacherMap.get(task.teacher_id) || "Professor",
      disciplineId: task.discipline_id,
      disciplineName: task.discipline_id
        ? disciplineMap.get(task.discipline_id) || null
        : null,
      dueDate: task.due_date,
      maxScore: task.max_score,
      type: task.type,
      attachmentUrl:
        (task as { attachment_url?: string | null }).attachment_url ?? null,
      alreadySubmitted: Boolean(gradeMap.get(task.id)),
    }));

    const selectedTask = context.selectedTaskId
      ? taskContextItems.find((task) => task.taskId === context.selectedTaskId) || null
      : null;

    let extractedText = "";
    let extractedTextSnippet = "";

    if (context.attachment?.path) {
      if (!context.attachment.path.startsWith(`${user.id}/`)) {
        return createOpenAIStyleSseResponse(
          JSON.stringify({
            intent: "ERROR",
            decision: "NO_ACTION",
            message: "O PDF enviado não pertence ao seu perfil autenticado.",
          } satisfies StudentCopilotResponse),
        );
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from("student-submissions")
        .download(context.attachment.path);

      if (fileError || !fileData) {
        return createOpenAIStyleSseResponse(
          JSON.stringify({
            intent: "ERROR",
            decision: "NO_ACTION",
            message: "Não consegui acessar o PDF enviado. Tente anexar o arquivo novamente.",
          } satisfies StudentCopilotResponse),
        );
      }

      try {
        const extracted = await extractPdfTextFromBuffer(await fileData.arrayBuffer());
        extractedText = extracted.text;
        extractedTextSnippet = extracted.snippet;
      } catch (error) {
        console.error("student-copilot pdf extraction error", error);
        return createOpenAIStyleSseResponse(
          JSON.stringify({
            intent: "ERROR",
            decision: "NO_ACTION",
            message: "Não consegui ler o conteúdo do PDF enviado. Verifique se o arquivo está legível.",
          } satisfies StudentCopilotResponse),
        );
      }
    }

    const latestUserMessage =
      [...messages].reverse().find((message) => message.role === "user")?.content || "";

    if (!openAIApiKey) {
      return jsonResponse({ error: "OPENAI_API_KEY não está configurada" }, 503);
    }

    const systemPrompt = buildSupportPrompt({
      studentName: student.name,
      grade: student.grade,
      tasks: taskContextItems,
      selectedTask,
      latestUserMessage,
      extractedText,
      extractedTextSnippet,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("student-copilot OpenAI error", response.status, errorText);

      return jsonResponse(
        {
          error:
            response.status === 429
              ? "Rate limit exceeded"
              : "Não foi possível processar a solicitação no momento",
        },
        response.status === 429 ? 429 : 502,
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("student-copilot error", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
