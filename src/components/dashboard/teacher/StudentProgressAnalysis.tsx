import { useState } from 'react';
import { 
  BarChart2, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Brain, 
  Send, 
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StudentActivity {
  id: string;
  date: string;
  mode: 'CONCEPT' | 'PRACTICE' | 'DIAGNOSTIC' | 'REVIEW';
  topic: string;
  duration: string;
  risk: 'stable' | 'warning' | 'critical';
}

interface StudentProgressAnalysisProps {
  onBack: () => void;
  onStartPlanning: () => void;
}

const MOCK_ACTIVITIES: StudentActivity[] = [
  {
    id: '1',
    date: '08/01/2026 19:35',
    mode: 'CONCEPT',
    topic: 'quero aprender o que é uma pla...',
    duration: '2 min',
    risk: 'stable',
  },
  {
    id: '2',
    date: '07/01/2026 14:22',
    mode: 'PRACTICE',
    topic: 'Exercícios de frações e decimais',
    duration: '15 min',
    risk: 'stable',
  },
  {
    id: '3',
    date: '05/01/2026 10:10',
    mode: 'DIAGNOSTIC',
    topic: 'Avaliação inicial de Matemática',
    duration: '8 min',
    risk: 'warning',
  },
];

const STATS = {
  totalSessions: 1,
  riskAlerts: 0,
  averageTime: '2.0 min',
  systemStatus: 'Ativo',
};

const MODE_COLORS: Record<string, string> = {
  CONCEPT: 'bg-success text-success-foreground',
  PRACTICE: 'bg-warning text-warning-foreground',
  DIAGNOSTIC: 'bg-primary text-primary-foreground',
  REVIEW: 'bg-secondary text-secondary-foreground',
};

const RISK_CONFIG = {
  stable: {
    label: 'ESTÁVEL',
    icon: Sparkles,
    color: 'text-success',
  },
  warning: {
    label: 'ATENÇÃO',
    icon: AlertTriangle,
    color: 'text-warning',
  },
  critical: {
    label: 'CRÍTICO',
    icon: AlertTriangle,
    color: 'text-destructive',
  },
};

export function StudentProgressAnalysis({ onBack, onStartPlanning }: StudentProgressAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Header with Back */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-xl font-bold">Análise de Progresso dos Alunos</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
              Total de Sessões
            </p>
            <p className="text-4xl font-bold">{STATS.totalSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive uppercase tracking-wide mb-1">
              Alertas de Risco
            </p>
            <p className="text-4xl font-bold text-destructive">{STATS.riskAlerts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
              Tempo Médio
            </p>
            <p className="text-4xl font-bold">{STATS.averageTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
              Status Sistema
            </p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <span className="text-xl font-semibold text-success">{STATS.systemStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Copiloto Pedagógico Card */}
        <Card className="bg-success text-success-foreground overflow-hidden">
          <CardContent className="p-6 flex flex-col h-full min-h-[220px]">
            <div className="p-3 rounded-xl bg-success-foreground/20 w-fit mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Copiloto Pedagógico</h3>
              <p className="text-success-foreground/80 mb-4">
                Modo Maker: Crie trilhas de aprendizagem, sequências didáticas e adapte materiais para sua turma com apoio da IA.
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="gap-2 w-fit bg-success-foreground/20 hover:bg-success-foreground/30 text-success-foreground"
              onClick={onStartPlanning}
            >
              Iniciar Planejamento
              <Send className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Lógica de Alerta Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="text-xl font-bold">Lógica de Alerta Precoce</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              O EducAI monitora sinais de baixa performance e desengajamento. O sistema dispara alertas quando:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                <p>
                  <strong>Omissão:</strong> Estudante não acessa a plataforma há mais de 3 dias.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-warning mt-2 shrink-0" />
                <p>
                  <strong>Dificuldade Verbalizada:</strong> Palavras-chave como "travado", "não entendi" ou "ajuda" em sessões recentes.
                </p>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>
                  <strong>Duração Crítica:</strong> Sessões excessivamente curtas para o modo "Prática".
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Activity Flow Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fluxo de Atividades dos Alunos</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
            Atualizado em tempo real
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DATA</TableHead>
                <TableHead>MODO</TableHead>
                <TableHead>TÓPICO/EVIDÊNCIA</TableHead>
                <TableHead>DURAÇÃO</TableHead>
                <TableHead>RISCO</TableHead>
                <TableHead>AÇÃO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ACTIVITIES.map((activity) => {
                const riskConfig = RISK_CONFIG[activity.risk];
                const RiskIcon = riskConfig.icon;
                
                return (
                  <TableRow key={activity.id}>
                    <TableCell className="text-muted-foreground">
                      {activity.date}
                    </TableCell>
                    <TableCell>
                      <Badge className={MODE_COLORS[activity.mode]}>
                        {activity.mode}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {activity.topic}
                    </TableCell>
                    <TableCell>{activity.duration}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${riskConfig.color}`}>
                        <RiskIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{riskConfig.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" className="gap-1 text-primary p-0">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
