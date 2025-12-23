import { useState } from 'react';
import { Building, TrendingUp, Target, Hammer, FileText, DollarSign, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DELINQUENCY_DATA = [
  { turma: '1º Ano', valor: 2500, percentual: 8 },
  { turma: '2º Ano', valor: 4200, percentual: 14 },
  { turma: '3º Ano', valor: 8500, percentual: 28 },
];

const ENROLLMENT_DATA = [
  { name: 'Matriculados', value: 850, color: 'hsl(217, 91%, 50%)' },
  { name: 'Meta Restante', value: 150, color: 'hsl(220, 14%, 90%)' },
];

const PROJECTS = [
  { id: 1, title: 'Reforma Banheiro Bloco A', status: 'em_andamento', budget: 'R$ 45.000,00', progress: 65 },
  { id: 2, title: 'Verba Parlamentar - Laboratório', status: 'recebida', budget: 'R$ 120.000,00', progress: 100 },
  { id: 3, title: 'Climatização Salas', status: 'planejado', budget: 'R$ 80.000,00', progress: 0 },
  { id: 4, title: 'Material Didático 2024', status: 'em_andamento', budget: 'R$ 25.000,00', progress: 40 },
];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  em_andamento: { label: 'Em Andamento', className: 'bg-warning/10 text-warning' },
  recebida: { label: 'Recebida', className: 'bg-success/10 text-success' },
  planejado: { label: 'Planejado', className: 'bg-muted text-muted-foreground' },
};

export function DirectorDashboard() {
  const [documentInput, setDocumentInput] = useState('');

  const handleGenerateDocument = () => {
    if (!documentInput.trim()) return;

    if ((window as any).addAIMessage) {
      (window as any).addAIMessage(
        `📄 Gerando documento: "${documentInput}"\n\n` +
        '✅ Documento formal gerado com sucesso!\n\n' +
        '**Prévia:**\n' +
        '---\n' +
        `ADVERTÊNCIA ESCOLAR\n\n` +
        `Aos responsáveis pelo aluno(a) mencionado(a),\n\n` +
        `Vimos por meio desta comunicar que...\n\n` +
        '---\n' +
        'Deseja fazer download do PDF completo?'
      );
    }
    setDocumentInput('');
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">850</p>
              <p className="text-sm text-muted-foreground">Alunos Matriculados</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ 1.2M</p>
              <p className="text-sm text-muted-foreground">Receita Anual</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">12%</p>
              <p className="text-sm text-muted-foreground">Taxa Inadimplência</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Projetos Ativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delinquency Chart */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-destructive" />
              Inadimplência por Turma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DELINQUENCY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="turma" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="valor" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enrollment Goal */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-primary" />
              Meta de Matrículas 2024
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={ENROLLMENT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ENROLLMENT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">85%</p>
                  <p className="text-xs text-muted-foreground">da meta</p>
                </div>
              </div>
            </div>
            <div className="ml-6 space-y-2">
              <p className="text-sm"><span className="font-semibold">850</span> matriculados</p>
              <p className="text-sm"><span className="font-semibold">1.000</span> meta anual</p>
              <p className="text-sm text-muted-foreground">Faltam 150 alunos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects & Document Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hammer className="w-5 h-5 text-warning" />
              Obras e Recursos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {PROJECTS.map((project) => (
              <div key={project.id} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{project.title}</h4>
                  <Badge className={STATUS_LABELS[project.status].className}>
                    {STATUS_LABELS[project.status].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{project.budget}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="w-20 h-2" />
                    <span className="text-xs font-medium">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Document Generator */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5 text-primary" />
              Burocracia Zero
            </CardTitle>
            <CardDescription>
              Gere documentos formais automaticamente com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Ex: Advertência João Silva, Declaração de Matrícula..."
                value={documentInput}
                onChange={(e) => setDocumentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateDocument()}
              />
              <Button onClick={handleGenerateDocument} className="w-full gap-2">
                <FileText className="w-4 h-4" />
                Gerar Documento
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Documentos recentes:</p>
              <div className="space-y-2">
                {['Ata de Reunião - 20/12', 'Declaração Maria Santos', 'Ofício Secretaria'].map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}