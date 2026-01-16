import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch Schools with Region and Metrics
    const { data: schools, error: dbError } = await supabase
      .from('schools')
      .select(`
        *,
        regions (name),
        school_metrics (subject, grade)
      `);

    if (dbError) {
      console.error("DB Error:", dbError);
      throw new Error("Falha ao buscar dados das escolas");
    }

    // 2. Format Data for Context
    const schoolsData = "ESCOLAS DA REDE:\n" + schools.map((s: any, index: number) => {
      const metrics = s.school_metrics.map((m: any) => `${m.subject === 'math' ? 'Matemática' : m.subject === 'languages' ? 'Português' : m.subject === 'sciences' ? 'Ciências' : 'Humanidades'}: ${m.grade}`).join(" | ");
      return `${index + 1}. ${s.name} | ${s.regions?.name} | ${s.total_students} alunos | ${s.permanence}% permanência | Nota Média ${s.average_grade} | ${metrics} | ${s.risk_level === 'stable' ? 'ESTÁVEL' : s.risk_level === 'alert' ? 'ALERTA' : 'CRÍTICO'}`;
    }).join("\n");

    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `Você é o EduGov Copilot, um assistente de inteligência artificial especializado em gestão educacional pública.
Sua missão é atuar como um analista de dados sênior que dialoga com gestores regionais e gera visualizações de dados (dashboards) sob demanda.

DADOS DISPONÍVEIS (Contexto "Aprendu Rede"):
${schoolsData}

CONTRATO DE RESPOSTA (JSON):
Você deve SEMPRE responder APENAS com um objeto JSON válido seguindo estritamente esta estrutura (EduGovResponseV2):

{
  "intent": "PERFORMANCE_COMPARE" | "COMPLIANCE_DELAY" | "TREND_MONITORING" | "EQUITY_GAP" | "INTERVENTION_TARGETING" | "GENERAL_QUERY",
  "decision": "NO_DASHBOARD" | "CREATE_DASHBOARD" | "UPDATE_DASHBOARD" | "MERGE_DASHBOARDS",
  "message": "Texto curto explicativo para o gestor (max 2 frases)",
  "dashboard": { // Apenas se decision === CREATE_DASHBOARD
    "id": "dash_timestamp",
    "title": "Título Executivo do Dashboard",
    "subtitle": "Subtítulo descritivo",
    "createdAt": "ISO String",
    "intent": "Igual ao root intent",
    "viewMode": "executive",
    "filters": {"region": "string", "period": "string", "discipline": "string"},
    "widgets": [
      {
        "id": "unique_widget_id",
        "type": "RankedTable" | "KPIGrid" | "HeatmapRegion" | "TimeSeries" | "StatusSLA" | "Distribution",
        "title": "Título do Widget",
        "columns": [ // Apenas para RankedTable
          {"key": "prop_name", "label": "Nome Coluna", "type": "text" | "number" | "badge" | "progress"}
        ],
        "data": {
          "rows": [], // Array de objetos para Table/Heatmap
          "value": 0, // Para KPI
          "series": [] // Para TimeSeries
        }
      }
    ],
    "axes": {"entity": "school", "metric": "grade"}
  },
  "patch": [], // JSON Patch se decision === UPDATE_DASHBOARD (rfc6902)
  "notes": ["Explicação técnica curta se necessário"]
}

REGRAS DE NEGÓCIO:
1. ANÁLISE DE INTENÇÃO:
   - "Comparar escolas/regiões" -> PERFORMANCE_COMPARE
   - "Quem não entregou?", "Atrasos" -> COMPLIANCE_DELAY
   - "Evolução histórica", "Tendência" -> TREND_MONITORING
   - "Desigualdade", "Gaps" -> EQUITY_GAP
   - "Onde focar?", "Escolas críticas" -> INTERVENTION_TARGETING
   - Perguntas gerais -> GENERAL_QUERY (decision: NO_DASHBOARD)

2. CRIAÇÃO DE DASHBOARD (CREATE_DASHBOARD):
   - Se o usuário pedir uma análise visual, crie um dashboard.
   - Use no MÁXIMO 2 widgets por dashboard para manter a clareza.
   - Widgets permitidos:
     * RankedTable: Para listas, rankings e comparativos detalhados.
     * KPIGrid: Para números grandes e destaques (ex: Total de Alunos, Média Geral).
     * Distribution: Para ver a dispersão de notas.
   - Sempre inclua dados reais extraídos do contexto "DADOS DISPONÍVEIS". Se o dado não existir, estime com base no contexto ou deixe vazio, mas mantenha a estrutura.

3. ATUALIZAÇÃO (UPDATE_DASHBOARD):
   - Se o usuário pedir para "remover a coluna X" ou "mostrar notas de Português em vez de Matemática", gere um JSON Patch.

4. ESTILO:
   - Títulos profissionais e diretos.
   - Badges para status: "ESTÁVEL" (success), "ALERTA" (warning), "CRÍTICO" (danger).

EXEMPLO DE RESPOSTA (User: "Quais as escolas com pior nota em matemática?"):
{
  "intent": "INTERVENTION_TARGETING",
  "decision": "CREATE_DASHBOARD",
  "message": "Identifiquei 3 escolas com desempenho crítico em matemática na região Norte e Leste.",
  "dashboard": {
    "id": "dash_123",
    "title": "Foco de Intervenção: Matemática",
    "subtitle": "Unidades com desempenho abaixo da média da rede (7.0)",
    "createdAt": "2024-03-20T10:00:00Z",
    "intent": "INTERVENTION_TARGETING",
    "viewMode": "executive",
    "filters": {"discipline": "Matemática"},
    "widgets": [
      {
        "id": "w1",
        "type": "RankedTable",
        "title": "Escolas em Nível Crítico/Alerta",
        "columns": [
          {"key": "name", "label": "ESCOLA", "type": "text"},
          {"key": "region", "label": "REGIÃO", "type": "text"},
          {"key": "mathGrade", "label": "NOTA MAT", "type": "number"},
          {"key": "status", "label": "STATUS", "type": "badge"}
        ],
        "data": {
          "rows": [
            {"name": "Escola Periférica Norte C", "region": "Norte", "mathGrade": 3.5, "status": "CRÍTICO"},
            {"name": "CIEP Norte B (Integral)", "region": "Norte", "mathGrade": 4.2, "status": "CRÍTICO"},
            {"name": "Escola Técnica Leste", "region": "Leste", "mathGrade": 5.2, "status": "CRÍTICO"}
          ]
        }
      }
    ],
    "axes": {"entity": "school", "metric": "mathGrade"}
  }
}

IMPORTANTE:
- NÃO use Markdown (\`\`\`json). Retorne APENAS o JSON cru.
- Se não houver dados suficientes para uma resposta precisa, diga isso na "message" e decida NO_DASHBOARD.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
      throw new Error(`OpenAI API error: ${response.status}`);
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
