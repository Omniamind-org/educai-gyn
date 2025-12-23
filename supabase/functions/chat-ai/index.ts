import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation constants
const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_COUNT = 50;
const VALID_ROLES = ['aluno', 'professor', 'coordenacao', 'diretor'];
const VALID_PERSONAS = ['Padrão', 'Cora Coralina (Regional)', 'Cientista'];

// Validation functions
const validateMessages = (messages: unknown): { role: string; content: string }[] => {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }
  
  if (messages.length > MAX_MESSAGES_COUNT) {
    throw new Error(`Maximum ${MAX_MESSAGES_COUNT} messages allowed`);
  }
  
  return messages.map((msg, index) => {
    if (typeof msg !== 'object' || msg === null) {
      throw new Error(`Message at index ${index} must be an object`);
    }
    
    const { role, content } = msg as { role?: unknown; content?: unknown };
    
    if (typeof role !== 'string' || !['user', 'assistant'].includes(role)) {
      throw new Error(`Invalid message role at index ${index}`);
    }
    
    if (typeof content !== 'string') {
      throw new Error(`Message content at index ${index} must be a string`);
    }
    
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message at index ${index} exceeds ${MAX_MESSAGE_LENGTH} characters`);
    }
    
    return { role, content: content.trim() };
  });
};

const validateRole = (role: unknown): string => {
  if (typeof role !== 'string' || !VALID_ROLES.includes(role)) {
    return 'aluno'; // Default to 'aluno' if invalid
  }
  return role;
};

const validatePersona = (persona: unknown): string => {
  if (typeof persona !== 'string' || !VALID_PERSONAS.includes(persona)) {
    return 'Padrão'; // Default to 'Padrão' if invalid
  }
  return persona;
};

const validateContext = (context: unknown): { activities?: any[]; studentName?: string; level?: number; xp?: number; streak?: number } | undefined => {
  if (context === undefined || context === null) {
    return undefined;
  }
  
  if (typeof context !== 'object') {
    return undefined;
  }
  
  const ctx = context as Record<string, unknown>;
  const validated: { activities?: any[]; studentName?: string; level?: number; xp?: number; streak?: number } = {};
  
  // Validate studentName
  if (typeof ctx.studentName === 'string' && ctx.studentName.length <= 100) {
    validated.studentName = ctx.studentName.trim();
  }
  
  // Validate level
  if (typeof ctx.level === 'number' && ctx.level >= 0 && ctx.level <= 100) {
    validated.level = Math.floor(ctx.level);
  }
  
  // Validate xp
  if (typeof ctx.xp === 'number' && ctx.xp >= 0 && ctx.xp <= 1000000) {
    validated.xp = Math.floor(ctx.xp);
  }
  
  // Validate streak
  if (typeof ctx.streak === 'number' && ctx.streak >= 0 && ctx.streak <= 365) {
    validated.streak = Math.floor(ctx.streak);
  }
  
  // Validate activities array
  if (Array.isArray(ctx.activities)) {
    validated.activities = ctx.activities.slice(0, 20).map(act => {
      if (typeof act !== 'object' || act === null) return null;
      const a = act as Record<string, unknown>;
      return {
        title: typeof a.title === 'string' ? a.title.slice(0, 100) : '',
        subject: typeof a.subject === 'string' ? a.subject.slice(0, 50) : '',
        dueDate: typeof a.dueDate === 'string' ? a.dueDate.slice(0, 20) : '',
        type: typeof a.type === 'string' ? a.type.slice(0, 20) : '',
        xp: typeof a.xp === 'number' ? Math.floor(a.xp) : 0,
      };
    }).filter(Boolean);
  }
  
  return validated;
};

const buildStudentPrompt = (context?: { activities?: any[]; studentName?: string; level?: number; xp?: number; streak?: number }) => {
  let prompt = `Você é um assistente de estudos inteligente e amigável chamado EducAI. Você ajuda alunos com:
- Explicações de conteúdo de forma clara e didática
- Correção de textos e redações (sem dar respostas prontas, apenas dicas)
- Dúvidas sobre atividades e exercícios
- Motivação e dicas de estudo
- Gamificação e metas de aprendizado
Sempre seja encorajador e use emojis ocasionalmente. Responda em português brasileiro.`;

  if (context) {
    prompt += `\n\n=== CONTEXTO DO ALUNO ===`;
    
    if (context.studentName) {
      prompt += `\nNome do aluno: ${context.studentName}`;
    }
    if (context.level) {
      prompt += `\nNível atual: ${context.level}`;
    }
    if (context.xp) {
      prompt += `\nXP: ${context.xp}`;
    }
    if (context.streak) {
      prompt += `\nSequência de dias estudando: ${context.streak} dias`;
    }
    
    if (context.activities && context.activities.length > 0) {
      prompt += `\n\nATIVIDADES PENDENTES DO ALUNO:`;
      context.activities.forEach((act, i) => {
        prompt += `\n${i + 1}. ${act.title}`;
        prompt += `\n   - Matéria: ${act.subject}`;
        prompt += `\n   - Data de entrega: ${act.dueDate}`;
        prompt += `\n   - Tipo: ${act.type === 'essay' ? 'Redação' : act.type === 'exercise' ? 'Exercício' : 'Quiz'}`;
        prompt += `\n   - XP: ${act.xp}`;
      });
      prompt += `\n\nUse essas informações para responder perguntas sobre entregas, prazos e atividades do aluno.`;
    }
  }

  return prompt;
};

const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  professor: `Você é um assistente pedagógico inteligente chamado EducAI para professores. Você ajuda com:
- Criação de planos de aula alinhados à BNCC
- Sugestões de atividades e metodologias ativas
- Criação de quizzes e avaliações gamificadas
- Ideias para tornar aulas mais engajadoras
- Análise de desempenho de turmas
Seja profissional mas acessível. Responda em português brasileiro.`,

  coordenacao: `Você é um assistente de coordenação pedagógica chamado EducAI. Você ajuda com:
- Análise de aderência de planos de aula à BNCC
- Identificação de lacunas em competências
- Sugestões de adequação curricular
- Acompanhamento pedagógico
- Relatórios e indicadores educacionais
Seja objetivo e fundamentado. Responda em português brasileiro.`,

  diretor: `Você é um assistente de gestão escolar chamado EducAI para diretores. Você ajuda com:
- Geração de documentos formais (advertências, declarações, ofícios)
- Análise de indicadores financeiros
- Planejamento estratégico
- Gestão de projetos e obras
- Comunicação institucional
Seja formal e profissional quando necessário. Responda em português brasileiro.`,
};

const PERSONA_STYLES: Record<string, string> = {
  'Padrão': '',
  'Cora Coralina (Regional)': 'Responda com o estilo poético e regional de Cora Coralina, usando expressões goianas e metáforas da terra.',
  'Cientista': 'Responda com rigor científico, citando dados e metodologias quando possível.',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Backend auth is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // Validate all inputs
    const validatedMessages = validateMessages(body.messages);
    const validatedRole = validateRole(body.role);
    const validatedPersona = validatePersona(body.persona);
    const validatedContext = validateContext(body.context);

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não está configurada');
    }

    console.log('Validated request - user:', user.id, 'role:', validatedRole, 'persona:', validatedPersona, 'messages:', validatedMessages.length);

    let systemPrompt: string;
    if (validatedRole === 'aluno') {
      systemPrompt = buildStudentPrompt(validatedContext);
    } else {
      systemPrompt = ROLE_SYSTEM_PROMPTS[validatedRole] || buildStudentPrompt();
    }
    
    const personaStyle = PERSONA_STYLES[validatedPersona] || '';
    const fullSystemPrompt = personaStyle ? `${systemPrompt}\n\n${personaStyle}` : systemPrompt;

    console.log('Calling OpenAI with role:', validatedRole, 'persona:', validatedPersona);
    console.log('Messages count:', validatedMessages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...validatedMessages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_completion_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    console.log('AI response received, length:', aiMessage.length);

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});