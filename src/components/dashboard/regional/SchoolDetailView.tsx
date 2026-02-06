import { useState } from 'react';
import { SchoolUnit } from '@/data/regionalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  Monitor, 
  Users,
  Building,
  GraduationCap
} from 'lucide-react';

interface SchoolDetailViewProps {
  school: SchoolUnit;
  onBack: () => void;
}

export function SchoolDetailView({ school, onBack }: SchoolDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getRiskBadge = (level: SchoolUnit['riskLevel']) => {
    switch (level) {
      case 'stable':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">REGULAR</Badge>;
      case 'alert':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0">ATENÇÃO ALTA</Badge>;
      case 'critical':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">CRÍTICO</Badge>;
    }
  };

  const getProgressColor = (value: number, max: number = 10) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  const performanceAreas = [
    { name: 'Matemática', value: school.academicPerformance.math, color: 'bg-primary' },
    { name: 'Linguagens', value: school.academicPerformance.languages, color: 'bg-pink-500' },
    { name: 'Ciências', value: school.academicPerformance.sciences, color: 'bg-success' },
    { name: 'Humanas', value: school.academicPerformance.humanities, color: 'bg-warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Visão de Rede
      </button>

      {/* School Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{school.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary">{school.region}</Badge>
                <Badge variant="outline">{school.totalStudents} ALUNOS</Badge>
              </div>
            </div>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4" />
              Falar com Diretor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="academic">Pedagógico</TabsTrigger>
          <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
          <TabsTrigger value="staff">Corpo Docente</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary" />
                Indicadores Chave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Risco Institucional
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {school.riskLevel === 'stable' ? 1 : school.riskLevel === 'alert' ? 2 : 3}
                    </span>
                    {getRiskBadge(school.riskLevel)}
                  </div>
                  <Progress value={school.riskLevel === 'stable' ? 33 : school.riskLevel === 'alert' ? 66 : 100} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Permanência Escolar
                  </p>
                  <span className="text-3xl font-bold text-primary">{school.permanence}%</span>
                  <Progress value={school.permanence} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Frequência Média
                  </p>
                  <span className="text-3xl font-bold text-primary">{school.attendance}%</span>
                  <p className="text-xs text-muted-foreground">Meta: 90%</p>
                  <Progress value={school.attendance} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {school.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {school.alerts.map((alert, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                      <span className="text-sm text-muted-foreground">{alert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="w-5 h-5 text-primary" />
                Desempenho Acadêmico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceAreas.map((area) => (
                  <div key={area.name} className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <p className="text-sm text-muted-foreground">{area.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{area.value}</span>
                      <span className="text-sm text-muted-foreground">/ 10</span>
                    </div>
                    <Progress 
                      value={area.value * 10} 
                      className="h-1.5"
                      style={{ '--progress-background': area.color } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="w-5 h-5 text-primary" />
                Infraestrutura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Score Highlight Section */}
              <div className="flex flex-col md:flex-row gap-6 items-center p-6 bg-muted/30 rounded-xl border border-border">
                {/* Gauge / Circular Score */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-muted/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={351.86}
                      strokeDashoffset={351.86 - ((school.infrastructure_score || 0) / 100) * 351.86}
                      className={`${
                        (school.infrastructure_score || 0) >= 80 ? 'text-success' : 
                        (school.infrastructure_score || 0) >= 50 ? 'text-warning' : 'text-destructive'
                      } transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{school.infrastructure_score ?? '-'}</span>
                    <span className="text-xs text-muted-foreground uppercase">Score</span>
                  </div>
                </div>

                {/* Score Description */}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-semibold flex items-center gap-2 justify-center md:justify-start">
                    Status da Infraestrutura
                    {(school.infrastructure_score || 0) >= 80 && (
                      <Badge className="bg-success text-success-foreground hover:bg-success">Excelente</Badge>
                    )}
                    {(school.infrastructure_score || 0) >= 50 && (school.infrastructure_score || 0) < 80 && (
                      <Badge className="bg-warning text-warning-foreground hover:bg-warning">Regular</Badge>
                    )}
                    {(school.infrastructure_score || 0) < 50 && school.infrastructure_score !== undefined && (
                      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">Crítico</Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground max-w-lg">
                    {(school.infrastructure_score || 0) >= 80 
                      ? "A escola apresenta condições ideais de funcionamento, com a maioria dos recursos ativos."
                      : (school.infrastructure_score || 0) >= 50 
                      ? "A escola requer atenção em alguns pontos de manutenção, mas mantém operacionalidade."
                      : "A escola apresenta múltiplos pontos críticos que exigem intervenção imediata da Regional."
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const INFRA_CONFIG: Record<string, { label: string; icon: any }> = {
                    library: { label: 'Biblioteca', icon: BookOpen },
                    lab: { label: 'Laboratório Info', icon: Monitor },
                    classrooms: { label: 'Salas de Aula', icon: Building },
                    bathrooms: { label: 'Banheiros', icon: AlertCircle },
                    kitchen: { label: 'Cozinha', icon: AlertCircle }, 
                    courtyard: { label: 'Pátio', icon: Building },
                    accessibility: { label: 'Acessibilidade', icon: AlertCircle },
                    internet: { label: 'Internet', icon: Monitor },
                    ventilation: { label: 'Ventilação', icon: Building },
                    lighting: { label: 'Iluminação', icon: AlertCircle },
                    water: { label: 'Água', icon: AlertCircle },
                    sanitation: { label: 'Sanitários', icon: AlertCircle },
                    cleanliness: { label: 'Limpeza', icon: AlertCircle },
                    desks: { label: 'Carteiras', icon: Building },
                    boards: { label: 'Lousas', icon: Monitor }
                  };

                  // Merge known keys from config with any extra keys in school.infrastructure
                  const keys = Array.from(new Set([
                    ...Object.keys(INFRA_CONFIG),
                    ...Object.keys(school.infrastructure || {})
                  ]));

                  // Filter to only show keys that arguably exist or are in our main config
                  return keys.map(key => {
                    const data = school.infrastructure?.[key];
                    const config = INFRA_CONFIG[key];
                    
                    // Skip if no data and not a main config item we want to show as 'N/A'
                    if (!data && !config) return null;

                    const Icon = config?.icon || Building;
                    const label = config?.label || key;
                    
                    // Resolve Status
                    const status = typeof data === 'string' ? data : data?.status;
                    const quantity = typeof data !== 'string' ? data?.quantity : null;
                    const legacyQuantity = key === 'library' ? (school.infrastructure as any)?.library?.books : 
                                           key === 'lab' ? (school.infrastructure as any)?.lab?.machines : null;
                    
                    const finalQuantity = quantity || legacyQuantity;

                    // Determine Badge
                     const badgeClass = status === 'good' || status === 'active'
                      ? 'bg-success/10 text-success' 
                      : (status === 'fair' || status === 'maintenance' ? 'bg-warning/10 text-warning' : 
                         (status === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'));
                      
                     const statusLabel = status === 'good' || status === 'active'
                      ? 'ATIVA' 
                      : (status === 'fair' || status === 'maintenance' ? 'MANUTENÇÃO' 
                      : (status === 'critical' ? 'CRÍTICO' : 'N/A'));

                    return (
                        <div key={key} className="p-4 rounded-lg border space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                            <h4 className="font-semibold capitalize">{label}</h4>
                            <p className="text-sm text-muted-foreground">
                                {finalQuantity ? (
                                    key === 'library' ? `Acervo: ${finalQuantity} livros` :
                                    key === 'lab' ? `${finalQuantity} Máquinas` :
                                    `Quantidade: ${finalQuantity}`
                                ) : (
                                    'Status reportado'
                                )}
                            </p>
                            </div>
                        </div>
                        <Badge className={badgeClass}>{statusLabel}</Badge>
                        </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-primary" />
                Corpo Docente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">Total de Professores</span>
                  <span className="font-semibold text-foreground">{school.teachers}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">Satisfação Docente (NPS)</span>
                  <span className={`font-semibold ${school.teacherSatisfaction >= 50 ? 'text-success' : school.teacherSatisfaction >= 30 ? 'text-warning' : 'text-destructive'}`}>
                    +{school.teacherSatisfaction}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">Formação Continuada</span>
                  <span className={`font-semibold ${school.continuedEducation >= 80 ? 'text-success' : school.continuedEducation >= 60 ? 'text-warning' : 'text-destructive'}`}>
                    {school.continuedEducation}% Concluído
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
