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
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Biblioteca</h4>
                      <p className="text-sm text-muted-foreground">
                        Acervo: {school.infrastructure.library.books.toLocaleString()} livros
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={school.infrastructure.library.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                    }
                  >
                    {school.infrastructure.library.status === 'active' ? 'ATIVA' : 'MANUTENÇÃO'}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Laboratório Info</h4>
                      <p className="text-sm text-muted-foreground">
                        {school.infrastructure.lab.machines} Máquinas
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={school.infrastructure.lab.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                    }
                  >
                    {school.infrastructure.lab.status === 'active' ? 'ATIVA' : 'MANUTENÇÃO'}
                  </Badge>
                </div>
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
