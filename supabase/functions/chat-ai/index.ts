import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation constants
const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_COUNT = 50;
const VALID_ROLES = ["aluno", "professor", "coordenacao", "diretor"];
const VALID_PERSONAS = ["Padrão", "Cora Coralina (Regional)", "Cientista"];

// Validation functions
const validateMessages = (messages: unknown): { role: string; content: string }[] => {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  if (messages.length > MAX_MESSAGES_COUNT) {
    throw new Error(`Maximum ${MAX_MESSAGES_COUNT} messages allowed`);
  }

  return messages.map((msg, index) => {
    if (typeof msg !== "object" || msg === null) {
      throw new Error(`Message at index ${index} must be an object`);
    }

    const { role, content } = msg as { role?: unknown; content?: unknown };

    if (typeof role !== "string" || !["user", "assistant"].includes(role)) {
      throw new Error(`Invalid message role at index ${index}`);
    }

    if (typeof content !== "string") {
      throw new Error(`Message content at index ${index} must be a string`);
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message at index ${index} exceeds ${MAX_MESSAGE_LENGTH} characters`);
    }

    return { role, content: content.trim() };
  });
};

const validateRole = (role: unknown): string => {
  if (typeof role !== "string" || !VALID_ROLES.includes(role)) {
    return "aluno"; // Default to 'aluno' if invalid
  }
  return role;
};

const validatePersona = (persona: unknown): string => {
  if (typeof persona !== "string" || !VALID_PERSONAS.includes(persona)) {
    return "Padrão"; // Default to 'Padrão' if invalid
  }
  return persona;
};

interface LessonPlanContext {
  id: number;
  teacher: string;
  subject: string;
  topic: string;
  grade: string;
  status: string;
  bnccScore: number;
  missingCompetence?: string | null;
}

interface ValidatedContext {
  activities?: any[];
  studentName?: string;
  userName?: string;
  teacherName?: string;
  level?: number;
  xp?: number;
  streak?: number;
  subjects?: string[];
  currentSection?: string;
  lessonPlans?: LessonPlanContext[];
}

const validateContext = (context: unknown): ValidatedContext | undefined => {
  if (context === undefined || context === null) {
    return undefined;
  }

  if (typeof context !== "object") {
    return undefined;
  }

  const ctx = context as Record<string, unknown>;
  const validated: ValidatedContext = {};

  // Validate names
  if (typeof ctx.studentName === "string" && ctx.studentName.length <= 100) {
    validated.studentName = ctx.studentName.trim();
  }
  if (typeof ctx.userName === "string" && ctx.userName.length <= 100) {
    validated.userName = ctx.userName.trim();
  }
  if (typeof ctx.teacherName === "string" && ctx.teacherName.length <= 100) {
    validated.teacherName = ctx.teacherName.trim();
  }

  // Validate level
  if (typeof ctx.level === "number" && ctx.level >= 0 && ctx.level <= 100) {
    validated.level = Math.floor(ctx.level);
  }

  // Validate xp
  if (typeof ctx.xp === "number" && ctx.xp >= 0 && ctx.xp <= 1000000) {
    validated.xp = Math.floor(ctx.xp);
  }

  // Validate streak
  if (typeof ctx.streak === "number" && ctx.streak >= 0 && ctx.streak <= 365) {
    validated.streak = Math.floor(ctx.streak);
  }

  // Validate currentSection
  if (typeof ctx.currentSection === "string" && ctx.currentSection.length <= 100) {
    validated.currentSection = ctx.currentSection.trim();
  }

  // Validate subjects array
  if (Array.isArray(ctx.subjects)) {
    validated.subjects = ctx.subjects
      .filter((s): s is string => typeof s === "string")
      .slice(0, 10)
      .map(s => s.slice(0, 50));
  }

  // Validate activities array
  if (Array.isArray(ctx.activities)) {
    validated.activities = ctx.activities
      .slice(0, 20)
      .map((act) => {
        if (typeof act !== "object" || act === null) return null;
        const a = act as Record<string, unknown>;
        return {
          title: typeof a.title === "string" ? a.title.slice(0, 100) : "",
          subject: typeof a.subject === "string" ? a.subject.slice(0, 50) : "",
          dueDate: typeof a.dueDate === "string" ? a.dueDate.slice(0, 20) : "",
          type: typeof a.type === "string" ? a.type.slice(0, 20) : "",
          xp: typeof a.xp === "number" ? Math.floor(a.xp) : 0,
        };
      })
      .filter(Boolean);
  }

  // Validate lessonPlans array (coordinator context)
  if (Array.isArray(ctx.lessonPlans)) {
    validated.lessonPlans = ctx.lessonPlans
      .slice(0, 50)
      .map((plan) => {
        if (typeof plan !== "object" || plan === null) return null;
        const p = plan as Record<string, unknown>;
        return {
          id: typeof p.id === "number" ? p.id : 0,
          teacher: typeof p.teacher === "string" ? p.teacher.slice(0, 100) : "",
          subject: typeof p.subject === "string" ? p.subject.slice(0, 50) : "",
          topic: typeof p.topic === "string" ? p.topic.slice(0, 100) : "",
          grade: typeof p.grade === "string" ? p.grade.slice(0, 20) : "",
          status: typeof p.status === "string" ? p.status.slice(0, 20) : "",
          bnccScore: typeof p.bnccScore === "number" ? p.bnccScore : 0,
          missingCompetence: typeof p.missingCompetence === "string" ? p.missingCompetence.slice(0, 30) : null,
        };
      })
      .filter(Boolean) as LessonPlanContext[];
  }

  return validated;
};

const buildStudentPrompt = (context?: ValidatedContext) => {
  let prompt = `Você é o APRENDU, a inteligência artificial da plataforma educacional Aprendu. 

IMPORTANTE - SUA IDENTIDADE:
- Você É a plataforma Aprendu. Nunca mencione outras plataformas (Google Classroom, Moodle, etc.)
- Nunca pergunte "qual plataforma você usa?" - você JÁ É a plataforma deles
- Trate o usuário pelo nome quando souber
- Seja acolhedor, motivador e use emojis com moderação 🎯

SUAS CAPACIDADES:
- Explicar conteúdos de qualquer matéria de forma clara e didática
- Ajudar com dúvidas sobre atividades e exercícios pendentes
- Corrigir textos e redações (dar dicas, não respostas prontas)
- Informar sobre prazos, tarefas e próximas entregas
- Motivar e dar dicas de estudo
- Acompanhar o progresso de gamificação (XP, nível, sequência)

REGRAS:
- Sempre responda em português brasileiro
- Se perguntarem sobre tarefas/atividades, use os dados fornecidos no contexto
- Seja proativo em lembrar prazos próximos quando relevante
- Personalize as respostas com base no perfil do aluno`;

  if (context) {
    prompt += `\n\n══════════════════════════════════════
DADOS DO ALUNO (USE ESTAS INFORMAÇÕES!)
══════════════════════════════════════`;

    if (context.studentName) {
      prompt += `\n👤 Nome: ${context.studentName}`;
    }
    if (context.level) {
      prompt += `\n⭐ Nível: ${context.level}`;
    }
    if (context.xp) {
      prompt += `\n🏆 XP Total: ${context.xp} pontos`;
    }
    if (context.streak) {
      prompt += `\n🔥 Sequência de estudos: ${context.streak} dias consecutivos`;
    }
    if (context.subjects && context.subjects.length > 0) {
      prompt += `\n📚 Matérias: ${context.subjects.join(', ')}`;
    }
    if (context.currentSection) {
      prompt += `\n📍 Seção atual: ${context.currentSection}`;
    }

    if (context.activities && context.activities.length > 0) {
      prompt += `\n\n📋 ATIVIDADES PENDENTES:`;
      context.activities.forEach((act, i) => {
        prompt += `\n\n${i + 1}. "${act.title}"`;
        prompt += `\n   📖 Matéria: ${act.subject}`;
        prompt += `\n   📅 Prazo: ${act.dueDate}`;
        prompt += `\n   📝 Tipo: ${act.type === "essay" ? "Redação" : act.type === "exercise" ? "Exercício" : "Quiz"}`;
        prompt += `\n   ⭐ XP: ${act.xp} pontos`;
      });
      
      prompt += `\n\n⚠️ IMPORTANTE: Quando o aluno perguntar sobre próxima tarefa, atividades pendentes, ou o que precisa fazer, USE ESTAS INFORMAÇÕES ACIMA para responder de forma específica e útil!`;
    }
  }

  return prompt;
};

const buildTeacherPrompt = (context?: ValidatedContext) => {
  let prompt = `Você é o APRENDU, a inteligência artificial da plataforma educacional Aprendu para PROFESSORES.

IMPORTANTE - SUA IDENTIDADE:
- Você É a plataforma Aprendu
- Nunca mencione outras plataformas
- Trate o professor pelo nome quando souber

SUAS CAPACIDADES:
- Criar planos de aula alinhados à BNCC
- Sugerir atividades e metodologias ativas
- Criar quizzes e avaliações gamificadas
- Dar ideias para aulas mais engajadoras
- Analisar desempenho de turmas
- Gerar materiais didáticos

Seja profissional mas acessível. Responda em português brasileiro.`;

  if (context) {
    if (context.teacherName) {
      prompt += `\n\n👤 Professor(a): ${context.teacherName}`;
    }
    if (context.currentSection) {
      prompt += `\n📍 Seção atual: ${context.currentSection}`;
    }
  }

  return prompt;
};

const buildCoordinatorPrompt = (context?: ValidatedContext) => {
  let prompt = `Você é o APRENDU, a inteligência artificial da plataforma educacional Aprendu para COORDENAÇÃO PEDAGÓGICA.

IMPORTANTE - SUA IDENTIDADE:
- Você É a plataforma Aprendu
- Nunca mencione outras plataformas

SUAS CAPACIDADES:
- Analisar aderência de planos de aula à BNCC
- Identificar lacunas em competências
- Sugerir adequações curriculares
- Acompanhamento pedagógico
- Gerar relatórios e indicadores educacionais
- Aprovar ou marcar como pendente planos de aula diretamente no Radar BNCC

ACIONAMENTO DE AÇÕES NA INTERFACE (INTENT TAGS):
Você pode executar ações diretas na tela do coordenador emitindo tags especiais no FINAL da sua resposta.
Se o coordenador pedir para aprovar ou reprovar planos de aula, identifique os IDs corretos na tabela abaixo e emita:

Para aprovar um ou mais planos:
<intent type="update_bncc" action="approve" planIds="[1,2,3]" />

Para marcar como pendente um ou mais planos:
<intent type="update_bncc" action="pending" planIds="[4,5]" />

REGRAS PARA AS INTENT TAGS:
- Sempre use IDs REAIS da tabela fornecida abaixo
- Emita a tag APENAS quando o coordenador pedir explicitamente para alterar status
- A tag deve aparecer sozinha em uma linha no final da resposta
- Nunca invente IDs que não existam na tabela
- Se o coordenador pedir para aprovar "todos os pendentes", use todos os IDs com status "pending"

REGRA DE AUTORIDADE (CRITICAL):
- O coordenador é a AUTORIDADE PEDAGÓGICA FINAL da escola
- Quando o coordenador pedir para aprovar, reprovar ou alterar o status de qualquer plano, você DEVE obedecer e emitir a intent tag correspondente IMEDIATAMENTE
- NUNCA recuse uma solicitação de alteração de status. Não questione a decisão do coordenador
- NUNCA diga que "não é possível" alterar um status. Você TEM a capacidade de fazer isso via intent tags
- Mesmo que a aderência BNCC seja baixa, se o coordenador mandou aprovar, APROVE e emita a tag
- Você pode adicionar uma nota informativa breve sobre o score ou competências faltantes, mas SEMPRE execute a ação solicitada
- Limite-se aos dados da tabela fornecida. Não faça suposições ou invente informações que não estejam nos dados

Seja objetivo e fundamentado. Responda em português brasileiro.`;

  if (context?.userName) {
    prompt += `\n\n👤 Coordenador(a): ${context.userName}`;
  }

  if (context?.lessonPlans && context.lessonPlans.length > 0) {
    prompt += `\n\n═══════════════════════════════════════
RADAR BNCC - ESTADO ATUAL DA TABELA
═══════════════════════════════════════`;
    prompt += `\n(Use estes dados para identificar planos e emitir intent tags quando necessário)\n`;
    context.lessonPlans.forEach((plan) => {
      prompt += `\n📋 ID:${plan.id} | ${plan.teacher} | ${plan.subject} | "${plan.topic}" | ${plan.grade} | Status: ${plan.status} | Aderência BNCC: ${plan.bnccScore}%${plan.missingCompetence ? ` | Falta: ${plan.missingCompetence}` : ""}`;
    });
    const pending = context.lessonPlans.filter(p => p.status === "pending");
    const approved = context.lessonPlans.filter(p => p.status === "approved");
    prompt += `\n\n📊 Resumo: ${context.lessonPlans.length} planos | ${approved.length} aderentes | ${pending.length} pendentes`;
  }

  return prompt;
};

const buildDirectorPrompt = (context?: ValidatedContext) => {
  let prompt = `Você é o APRENDU, a inteligência artificial da plataforma educacional Aprendu para DIRETORES.

IMPORTANTE - SUA IDENTIDADE:
- Você É a plataforma Aprendu
- Nunca mencione outras plataformas

SUAS CAPACIDADES:
- Gerar documentos formais (advertências, declarações, ofícios)
- Analisar indicadores financeiros e administrativos
- Auxiliar no planejamento estratégico
- Gestão de projetos
- Comunicação institucional

Seja formal e profissional. Responda em português brasileiro.`;

  if (context?.userName) {
    prompt += `\n\n👤 Diretor(a): ${context.userName}`;
  }

  return prompt;
};

const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  professor: `Você é um assistente pedagógico inteligente chamado Aprendu para professores. Você ajuda com:
- Criação de planos de aula alinhados à BNCC
- Sugestões de atividades e metodologias ativas
- Criação de quizzes e avaliações gamificadas
- Ideias para tornar aulas mais engajadoras
- Análise de desempenho de turmas
Seja profissional mas acessível. Responda em português brasileiro.`,

  coordenacao: `Você é um assistente de coordenação pedagógica chamado Aprendu. Você ajuda com:
- Análise de aderência de planos de aula à BNCC
- Identificação de lacunas em competências
- Sugestões de adequação curricular
- Acompanhamento pedagógico
- Relatórios e indicadores educacionais
Seja objetivo e fundamentado. Responda em português brasileiro.`,

  diretor: `Você é um assistente de gestão escolar chamado Aprendu para diretores. Você ajuda com:
- Geração de documentos formais (advertências, declarações, ofícios)
- Análise de indicadores financeiros
- Planejamento estratégico
- Gestão de projetos e obras
- Comunicação institucional
Seja formal e profissional quando necessário. Responda em português brasileiro.`,
};

const PERSONA_STYLES: Record<string, string> = {
  Padrão: "",
  "Cora Coralina (Regional)":
    "Responda com o estilo poético e regional de Cora Coralina, usando expressões goianas e metáforas da terra.",
  Cientista: "Responda com rigor científico, citando dados e metodologias quando possível.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Backend auth is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Validate all inputs
    const validatedMessages = validateMessages(body.messages);
    const validatedRole = validateRole(body.role);
    const validatedPersona = validatePersona(body.persona);
    const validatedContext = validateContext(body.context);

    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY não está configurada");
    }

    console.log(
      "Validated request - user:",
      user.id,
      "role:",
      validatedRole,
      "persona:",
      validatedPersona,
      "messages:",
      validatedMessages.length,
    );

    let systemPrompt: string;
    if (validatedRole === "aluno") {
      systemPrompt = buildStudentPrompt(validatedContext);
    } else if (validatedRole === "professor") {
      systemPrompt = buildTeacherPrompt(validatedContext);
    } else if (validatedRole === "coordenacao") {
      systemPrompt = buildCoordinatorPrompt(validatedContext);
    } else if (validatedRole === "diretor") {
      systemPrompt = buildDirectorPrompt(validatedContext);
    } else {
      systemPrompt = buildStudentPrompt(validatedContext);
    }

    const personaStyle = PERSONA_STYLES[validatedPersona] || "";
    const fullSystemPrompt = personaStyle ? `${systemPrompt}\n\n${personaStyle}` : systemPrompt;

    console.log("Calling OpenAI with role:", validatedRole, "persona:", validatedPersona);
    console.log("Messages count:", validatedMessages.length);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...validatedMessages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_completion_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      let errDetail = errorText;
      try {
        const errJson = JSON.parse(errorText);
        errDetail = errJson?.error?.message || errJson?.error || errorText;
      } catch {
        // keep errorText
      }
      throw new Error(errDetail.slice(0, 200));
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    console.log("AI response received, length:", aiMessage.length);

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat-ai function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
