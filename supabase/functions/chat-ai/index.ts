import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  aluno: `Você é um assistente de estudos inteligente e amigável chamado EducAI. Você ajuda alunos com:
- Explicações de conteúdo de forma clara e didática
- Correção de textos e redações (sem dar respostas prontas, apenas dicas)
- Dúvidas sobre atividades e exercícios
- Motivação e dicas de estudo
- Gamificação e metas de aprendizado
Sempre seja encorajador e use emojis ocasionalmente. Responda em português brasileiro.`,

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
    const { messages, role, persona } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não está configurada');
    }

    const systemPrompt = ROLE_SYSTEM_PROMPTS[role] || ROLE_SYSTEM_PROMPTS.aluno;
    const personaStyle = PERSONA_STYLES[persona] || '';
    const fullSystemPrompt = personaStyle ? `${systemPrompt}\n\n${personaStyle}` : systemPrompt;

    console.log('Calling OpenAI with role:', role, 'persona:', persona);
    console.log('Messages count:', messages.length);

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
          ...messages.map((m: { role: string; content: string }) => ({
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