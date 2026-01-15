import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, series, bnccObjective, description } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Validate required fields
    if (!topic) {
      return new Response(
        JSON.stringify({ error: "O tema da aula é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é um especialista em pedagogia e criação de planos de aula para o ensino brasileiro.
Você deve criar planos de aula detalhados, criativos e alinhados à Base Nacional Comum Curricular (BNCC).

IMPORTANTE: Comece DIRETAMENTE com o título ou objetivo do plano. NÃO inclua saudações, introduções, apresentações pessoais ou qualquer texto antes do conteúdo.

Seus planos devem incluir:
1. **Objetivo Geral**: O que os alunos devem aprender
2. **Objetivos Específicos**: Habilidades que serão desenvolvidas
3. **Competências BNCC**: Alinhamento com a BNCC
4. **Duração**: Tempo estimado da aula
5. **Materiais Necessários**: Lista de recursos
6. **Metodologia**: Passo a passo da aula
7. **Atividades**: Exercícios práticos e dinâmicos
8. **Avaliação**: Como avaliar o aprendizado
9. **Dicas para o Professor**: Sugestões extras

Use linguagem clara, seja criativo nas atividades e priorize metodologias ativas que engajem os alunos.
Responda sempre em português brasileiro.`;

    const userPrompt = `Crie um plano de aula completo com as seguintes informações:

**Tema da Aula:** ${topic}
${series ? `**Série/Ano:** ${series}` : ""}
${bnccObjective ? `**Objetivo BNCC:** ${bnccObjective}` : ""}
${description ? `**Informações Adicionais:** ${description}` : ""}

Por favor, crie um plano de aula detalhado, prático e engajador.`;

    console.log("Generating lesson plan with OpenAI gpt-5-mini for:", { topic, series, bnccObjective });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições da OpenAI excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "API key da OpenAI inválida ou expirada." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const lessonPlan = data.choices?.[0]?.message?.content;

    if (!lessonPlan) {
      throw new Error("Não foi possível gerar o plano de aula");
    }

    console.log("Lesson plan generated successfully with OpenAI");

    return new Response(
      JSON.stringify({ lessonPlan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao gerar plano de aula" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
