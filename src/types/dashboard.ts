// ==========================================
// DASHBOARD INTELIGENTE - TIPOS E CONTRATOS
// ==========================================

// Intenções gerenciais que o agente pode classificar
export type ManagerialIntent = 
  | 'PERFORMANCE_COMPARE'     // Comparação de desempenho entre escolas/regiões
  | 'COMPLIANCE_DELAY'        // Atrasos em entregas/conformidade
  | 'TREND_MONITORING'        // Monitoramento de tendências temporais
  | 'EQUITY_GAP'              // Análise de equidade e gaps
  | 'INTERVENTION_TARGETING'  // Identificação de alvos para intervenção
  | 'GENERAL_QUERY';          // Consulta geral sem dashboard

// Decisões que o agente pode tomar sobre dashboards
export type DashboardDecision = 
  | 'NO_DASHBOARD'        // Não requer dashboard
  | 'UPDATE_DASHBOARD'    // Atualizar dashboard existente
  | 'CREATE_DASHBOARD'    // Criar novo dashboard
  | 'MERGE_DASHBOARDS';   // Combinar dashboards existentes

// Tipos de widgets primitivos permitidos
export type WidgetType = 
  | 'RankedTable'
  | 'KPIGrid'
  | 'HeatmapRegion'
  | 'TimeSeries'
  | 'StatusSLA'
  | 'Distribution';

// View mode dos widgets
export type WidgetViewMode = 'table' | 'chart' | 'cards';

// Configuração de coluna para tabelas
export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'badge' | 'progress' | 'trend';
  format?: string;
  badgeConfig?: {
    [value: string]: {
      variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
      label: string;
    };
  };
}

// Dados para widgets
export interface WidgetData {
  rows?: Array<Record<string, unknown>>;
  value?: number;
  label?: string;
  trend?: number;
  series?: Array<{ name: string; data: number[] }>;
  categories?: string[];
  regions?: Array<{ id: string; name: string; value: number; risk: string }>;
}

// Configuração de widget
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  viewMode?: WidgetViewMode;
  columns?: TableColumn[];
  data: WidgetData;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  highlight?: {
    condition: 'top' | 'bottom' | 'threshold';
    value: number;
    color: 'success' | 'warning' | 'danger';
  };
}

// Configuração de filtros globais
export interface GlobalFilters {
  region?: string;
  period?: string;
  discipline?: string;
  grade?: string;
}

// Configuração completa de dashboard
export interface DashboardConfig {
  id: string;
  title: string;
  subtitle?: string;
  createdAt: string;
  intent: ManagerialIntent;
  viewMode: 'executive' | 'operational';
  filters: GlobalFilters;
  widgets: WidgetConfig[];
  axes: {
    entity?: string;      // escola, região, aluno
    time?: string;        // período, ano
    metric?: string;      // nota, permanência, etc
    region?: string;      // região específica
  };
}

// Resposta estruturada do agente
export interface EduGovResponseV2 {
  intent: ManagerialIntent;
  decision: DashboardDecision;
  message: string;
  dashboard?: DashboardConfig;
  patch?: JsonPatch[];
  dataGaps?: string[];
  notes?: string[];
}

// JSON Patch para atualizações incrementais
export interface JsonPatch {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy';
  path: string;
  value?: unknown;
  from?: string;
}

// Mensagem do chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  dashboardId?: string;
  intent?: ManagerialIntent;
}

// Estado do registry de dashboards
export interface DashboardRegistry {
  activeDashboard: DashboardConfig | null;
  history: DashboardConfig[];
  filters: GlobalFilters;
}

// Dados mock para as escolas
export interface SchoolMetrics {
  id: string;
  name: string;
  region: string;
  regionId: string;
  totalStudents: number;
  permanence: number;
  averageGrade: number;
  mathGrade: number;
  portugueseGrade: number;
  scienceGrade: number;
  riskLevel: 'stable' | 'alert' | 'critical';
  engagement: number;
  submissionStatus: 'on_time' | 'delayed' | 'pending';
  trend: number;
}

// Métricas agregadas por região
export interface RegionMetrics {
  id: string;
  name: string;
  schoolCount: number;
  totalStudents: number;
  avgPermanence: number;
  avgGrade: number;
  criticalCount: number;
}
