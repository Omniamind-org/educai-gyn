import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const schoolsData = `
ESCOLAS DA REDE:
1. Escola Estadual Centro | Centro | 450 alunos | 92% permanência | Nota 7.8 | Matemática: 7.5 | ESTÁVEL
2. Escola Prof. Norte A | Norte | 320 alunos | 78% permanência | Nota 6.2 | Matemática: 5.8 | ALERTA
3. CIEP Norte B (Integral) | Norte | 290 alunos | 65% permanência | Nota 4.5 | Matemática: 4.2 | CRÍTICO
4. Colégio Sul Modelo | Sul | 510 alunos | 95% permanência | Nota 8.2 | Matemática: 8.0 | ESTÁVEL
5. Escola Técnica Leste | Leste | 280 alunos | 62% permanência | Nota 5.5 | Matemática: 5.2 | CRÍTICO
6. C.E. Oeste Integrado | Oeste | 410 alunos | 88% permanência | Nota 7.2 | Matemática: 7.0 | ESTÁVEL
7. Escola Centro Sul | Centro | 380 alunos | 89% permanência | Nota 7.5 | Matemática: 7.3 | ESTÁVEL
8. Escola Periférica Norte C | Norte | 260 alunos | 58% permanência | Nota 3.8 | Matemática: 3.5 | CRÍTICO
9. Escola Rural Oeste | Oeste | 180 alunos | 75% permanência | Nota 6.0 | Matemática: 5.8 | ALERTA
10. CAIC Sul Integrado | Sul | 420 alunos | 91% permanência | Nota 7.9 | Matemática: 7.7 | ESTÁVEL
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

    const systemPrompt = `Você é o EduGov Copilot, um assistente inteligente de gestão educacional que gera dashboards dinâmicos.

DADOS DISPONÍVEIS:
${schoolsData}

REGRAS DE RESPOSTA:
1. SEMPRE responda em JSON válido no formato EduGovResponseV2
2. Classifique a intenção: PERFORMANCE_COMPARE | COMPLIANCE_DELAY | TREND_MONITORING | EQUITY_GAP | INTERVENTION_TARGETING | GENERAL_QUERY
3. Decida: NO_DASHBOARD | CREATE_DASHBOARD | UPDATE_DASHBOARD
4. Para CREATE_DASHBOARD, inclua configuração completa do dashboard com widgets

FORMATO DE RESPOSTA (JSON):
{
  "intent": "PERFORMANCE_COMPARE",
  "decision": "CREATE_DASHBOARD",
  "message": "Mensagem curta para o usuário",
  "dashboard": {
    "id": "dash_${Date.now()}",
    "title": "Título do Dashboard",
    "subtitle": "Dados compilados sob demanda.",
    "createdAt": "${new Date().toISOString()}",
    "intent": "PERFORMANCE_COMPARE",
    "viewMode": "executive",
    "filters": {},
    "widgets": [
      {
        "id": "widget_1",
        "type": "RankedTable",
        "title": "Título do Widget",
        "columns": [
          {"key": "escola", "label": "ESCOLA", "type": "text"},
          {"key": "regiao", "label": "REGIÃO", "type": "text"},
          {"key": "nota", "label": "NOTA", "type": "number"}
        ],
        "data": {
          "rows": [
            {"escola": "Nome", "regiao": "Região", "nota": 5.5}
          ]
        }
      }
    ],
    "axes": {"entity": "escola", "metric": "nota"}
  }
}

TIPOS DE WIDGETS DISPONÍVEIS:
- RankedTable: tabela ranqueada (columns + data.rows)
- KPIGrid: grid de KPIs (data.rows com {label, value, trend, variant})
- Distribution: gráfico de barras horizontal (data.rows com {label, value})

EXEMPLOS:
- "escolas com menor nota em matemática" → CREATE_DASHBOARD com RankedTable ordenada por mathGrade ASC
- "compare regiões" → CREATE_DASHBOARD com RankedTable de regiões
- "quantas escolas críticas" → NO_DASHBOARD, apenas responda

Responda APENAS com JSON válido, sem markdown.`;

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
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("EduGov error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
