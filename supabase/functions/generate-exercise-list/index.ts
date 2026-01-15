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
    const { topic, series, bnccObjective, description, exerciseCount } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate required fields
    if (!topic) {
      return new Response(
        JSON.stringify({ error: "O tema é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const count = exerciseCount || 10;

    const systemPrompt = `Você é um especialista em pedagogia e criação de listas de exercícios para o ensino brasileiro.
Você deve criar listas de exercícios variados, criativos e alinhados à Base Nacional Comum Curricular (BNCC).

IMPORTANTE: Comece DIRETAMENTE com o título da lista. NÃO inclua saudações, introduções, apresentações pessoais ou qualquer texto antes do conteúdo.

Suas listas devem incluir:
1. **Título da Lista**: Nome da lista de exercícios
2. **Objetivo de Aprendizagem**: O que os alunos devem praticar
3. **Competências BNCC**: Alinhamento com a BNCC
4. **Instruções Gerais**: Orientações para os alunos
5. **Exercícios**: Lista numerada com exercícios variados, incluindo:
   - Questões de múltipla escolha
   - Questões dissertativas
   - Questões de verdadeiro ou falso
   - Questões de completar lacunas
   - Problemas práticos
6. **Gabarito**: Respostas esperadas para cada questão

Use linguagem clara, seja criativo nas questões e varie os níveis de dificuldade (fácil, médio, difícil).
Responda sempre em português brasileiro.`;

    const userPrompt = `Crie uma lista de exercícios completa com as seguintes informações:

**Tema:** ${topic}
**Quantidade de Exercícios:** ${count} exercícios
${series ? `**Série/Ano:** ${series}` : ""}
${bnccObjective ? `**Habilidade BNCC:** ${bnccObjective}` : ""}
${description ? `**Informações Adicionais:** ${description}` : ""}

Por favor, crie uma lista de exercícios detalhada, variada e progressiva em dificuldade.`;

    console.log("Generating exercise list with Lovable AI for:", { topic, series, bnccObjective, count });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos na sua conta Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const exerciseList = data.choices?.[0]?.message?.content;

    if (!exerciseList) {
      throw new Error("Não foi possível gerar a lista de exercícios");
    }

    console.log("Exercise list generated successfully");

    return new Response(
      JSON.stringify({ exerciseList }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating exercise list:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao gerar lista de exercícios" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
