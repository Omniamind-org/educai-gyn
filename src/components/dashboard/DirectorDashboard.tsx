import { useState, useEffect } from 'react';
import { Building, TrendingUp, Target, Hammer, FileText, DollarSign, Users, Calendar, GraduationCap, Loader2, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalClasses: number;
  totalBoletos: number;
  boletosPendentes: number;
  boletosVencidos: number;
  boletosPagos: number;
  totalReceita: number;
  receitaPendente: number;
}

interface BoletosByGrade {
  grade: string;
  pendentes: number;
  vencidos: number;
  valor: number;
}

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [boletosByGrade, setBoletosByGrade] = useState<BoletosByGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
      const { data: students } = await supabase
        .from('students')
        .select('id, status, grade');
      
      // Fetch teachers
      const { data: teachers } = await supabase
        .from('teachers')
        .select('id, status');
      
      // Fetch classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id');
      
      // Fetch boletos
      const { data: boletos } = await supabase
        .from('boletos')
        .select('id, status, value, due_date, student_id, students(grade)');

      const today = new Date();
      
      // Process boletos
      const processedBoletos = (boletos || []).map((b: any) => {
        let status = b.status;
        if (status === 'pendente' && new Date(b.due_date) < today) {
          status = 'vencido';
        }
        return { ...b, status };
      });

      const boletosPendentes = processedBoletos.filter(b => b.status === 'pendente').length;
      const boletosVencidos = processedBoletos.filter(b => b.status === 'vencido').length;
      const boletosPagos = processedBoletos.filter(b => b.status === 'pago').length;
      
      const totalReceita = processedBoletos
        .filter(b => b.status === 'pago')
        .reduce((sum, b) => sum + (b.value || 0), 0);
      
      const receitaPendente = processedBoletos
        .filter(b => b.status !== 'pago')
        .reduce((sum, b) => sum + (b.value || 0), 0);

      // Group boletos by grade
      const gradeMap: Record<string, { pendentes: number; vencidos: number; valor: number }> = {};
      processedBoletos.forEach((b: any) => {
        const grade = b.students?.grade || 'Sem série';
        if (!gradeMap[grade]) {
          gradeMap[grade] = { pendentes: 0, vencidos: 0, valor: 0 };
        }
        if (b.status === 'pendente') {
          gradeMap[grade].pendentes += 1;
          gradeMap[grade].valor += b.value || 0;
        } else if (b.status === 'vencido') {
          gradeMap[grade].vencidos += 1;
          gradeMap[grade].valor += b.value || 0;
        }
      });

      const gradeData = Object.entries(gradeMap).map(([grade, data]) => ({
        grade: grade.replace(' do Ensino Médio', ''),
        ...data,
      }));

      setStats({
        totalStudents: students?.length || 0,
        activeStudents: students?.filter(s => s.status === 'ativo').length || 0,
        totalTeachers: teachers?.length || 0,
        activeTeachers: teachers?.filter(t => t.status === 'ativo').length || 0,
        totalClasses: classes?.length || 0,
        totalBoletos: processedBoletos.length,
        boletosPendentes,
        boletosVencidos,
        boletosPagos,
        totalReceita,
        receitaPendente,
      });

      setBoletosByGrade(gradeData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const inadimplenciaPercent = stats && stats.totalBoletos > 0 
    ? Math.round(((stats.boletosPendentes + stats.boletosVencidos) / stats.totalBoletos) * 100) 
    : 0;

  const enrollmentData = [
    { name: 'Matriculados', value: stats?.activeStudents || 0, color: 'hsl(142, 76%, 36%)' },
    { name: 'Meta Restante', value: Math.max(0, 1000 - (stats?.activeStudents || 0)), color: 'hsl(220, 14%, 90%)' },
  ];

  const enrollmentPercent = stats ? Math.min(100, Math.round((stats.activeStudents / 1000) * 100)) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
              <p className="text-sm text-muted-foreground">Alunos ({stats?.activeStudents || 0} ativos)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/10">
              <GraduationCap className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalTeachers || 0}</p>
              <p className="text-sm text-muted-foreground">Professores</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {((stats?.totalReceita || 0) / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground">Receita (boletos pagos)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inadimplenciaPercent}%</p>
              <p className="text-sm text-muted-foreground">Taxa Inadimplência</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <FileText className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.boletosVencidos || 0}</p>
              <p className="text-sm text-muted-foreground">Boletos Vencidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delinquency Chart */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-destructive" />
              Inadimplência por Série
            </CardTitle>
          </CardHeader>
          <CardContent>
            {boletosByGrade.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={boletosByGrade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="grade" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
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
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Nenhum dado de inadimplência
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Goal */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-primary" />
              Meta de Matrículas {new Date().getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={enrollmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {enrollmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{enrollmentPercent}%</p>
                  <p className="text-xs text-muted-foreground">da meta</p>
                </div>
              </div>
            </div>
            <div className="ml-6 space-y-2">
              <p className="text-sm"><span className="font-semibold">{stats?.activeStudents || 0}</span> matriculados</p>
              <p className="text-sm"><span className="font-semibold">1.000</span> meta anual</p>
              <p className="text-sm text-muted-foreground">Faltam {Math.max(0, 1000 - (stats?.activeStudents || 0))} alunos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boletos Summary & Document Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Boletos Summary */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5 text-primary" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-muted-foreground">Boletos Pagos</p>
                <p className="text-2xl font-bold text-success">{stats?.boletosPagos || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  R$ {(stats?.totalReceita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-warning">{stats?.boletosPendentes || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-destructive">{stats?.boletosVencidos || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm text-muted-foreground">Total de Boletos</p>
                <p className="text-2xl font-bold">{stats?.totalBoletos || 0}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Receita Pendente</span>
                <span className="font-semibold text-warning">
                  R$ {(stats?.receitaPendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Generator */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '800ms' }}>
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

      {/* Regional Vision Card + Projects Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sou Regional Card */}
        <Card className="opacity-0 animate-fade-in flex flex-col items-center justify-center py-8" style={{ animationDelay: '850ms' }}>
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Network className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold text-center">Sou Regional</CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">Visão da Rede e Expansão</p>
        </Card>

        {/* Projects Card - spans 2 columns */}
        <Card className="opacity-0 animate-fade-in md:col-span-2" style={{ animationDelay: '900ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hammer className="w-5 h-5 text-warning" />
              Obras e Recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}