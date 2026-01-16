import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock school data for context
const schoolContext = `
Dados da Rede de Ensino Regional:

RESUMO GERAL:
- Total de Alunos: 3.700
- Permanência Média: 79%
- Unidades em Atenção: 03
- Média Global de Notas: 6.8

UNIDADES:
1. Escola Estadual Centro (CENTRO) - 450 alunos, 92% permanência, status: REGULAR
2. Escola Prof. Norte A (NORTE) - 320 alunos, 78% permanência, status: ATENÇÃO ALTA
3. CIEP Norte B Integral (NORTE) - 290 alunos, 65% permanência, status: ATENÇÃO ALTA (crítico)
4. Colégio Sul Modelo (SUL) - 510 alunos, 95% permanência, status: REGULAR
5. Escola Técnica Leste (LESTE) - 280 alunos, 62% permanência, status: ATENÇÃO ALTA (crítico)
6. C.E. Oeste Integrado (OESTE) - 410 alunos, 88% permanência, status: REGULAR
7. Escola Centro Sul (CENTRO) - 380 alunos, 89% permanência, status: REGULAR

ANÁLISE POR REGIÃO:
- NORTE: 2 escolas, 610 alunos, permanência média 71.5%, maior risco de evasão
- CENTRO: 2 escolas, 830 alunos, permanência média 90.5%, situação estável
- SUL: 1 escola, 510 alunos, permanência 95%, melhor desempenho
- LESTE: 1 escola, 280 alunos, permanência 62%, atenção crítica necessária
- OESTE: 1 escola, 410 alunos, permanência 88%, situação regular

ALERTAS ATIVOS:
- Região Norte com taxa de evasão acima da média
- Escola Técnica Leste com infraestrutura deficitária
- CIEP Norte B necessita intervenção pedagógica urgente
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é o EduGov Copilot, um assistente inteligente de gestão educacional para a plataforma Aprendu. 
Sua função é ajudar gestores regionais a analisar dados educacionais e tomar decisões baseadas em evidências.

${schoolContext}

Diretrizes:
1. Responda sempre em português brasileiro
2. Use dados específicos das escolas quando disponíveis
3. Forneça análises claras e objetivas
4. Sugira ações quando identificar problemas
5. Use formatação markdown para melhor legibilidade
6. Seja proativo em identificar padrões e tendências
7. Quando comparar regiões ou escolas, use tabelas markdown

Você pode:
- Comparar desempenho entre escolas e regiões
- Identificar unidades em situação crítica
- Analisar tendências de permanência escolar
- Sugerir intervenções pedagógicas
- Gerar rankings e análises comparativas`;

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
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar solicitação" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("EduGov Copilot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
