import { ClipboardCheck, AlertCircle, CheckCircle, FileText, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LESSON_PLANS = [
  {
    id: 1,
    teacher: 'Maria Silva',
    subject: 'Português',
    topic: 'Literatura Brasileira: Modernismo',
    grade: '3º Ano',
    status: 'approved',
    bnccScore: 95,
    missingCompetence: null,
  },
  {
    id: 2,
    teacher: 'João Santos',
    subject: 'Matemática',
    topic: 'Geometria Espacial',
    grade: '2º Ano',
    status: 'approved',
    bnccScore: 88,
    missingCompetence: null,
  },
  {
    id: 3,
    teacher: 'Ana Oliveira',
    subject: 'História',
    topic: 'Idade Média',
    grade: '1º Ano',
    status: 'pending',
    bnccScore: 62,
    missingCompetence: 'EF09HI05',
  },
  {
    id: 4,
    teacher: 'Carlos Lima',
    subject: 'Ciências',
    topic: 'Ecossistemas',
    grade: '2º Ano',
    status: 'approved',
    bnccScore: 91,
    missingCompetence: null,
  },
  {
    id: 5,
    teacher: 'Paula Costa',
    subject: 'Geografia',
    topic: 'Urbanização no Brasil',
    grade: '3º Ano',
    status: 'pending',
    bnccScore: 55,
    missingCompetence: 'EF09GE02',
  },
];

export function CoordinatorDashboard() {
  const approvedCount = LESSON_PLANS.filter(p => p.status === 'approved').length;
  const pendingCount = LESSON_PLANS.filter(p => p.status === 'pending').length;

  const handleCompetenceClick = (competence: string | null) => {
    if (competence && (window as any).addAIMessage) {
      const explanations: Record<string, string> = {
        'EF09HI05': '📋 Este plano de aula não aborda adequadamente a competência EF09HI05 que trata da "diversidade cultural e identidade nacional". Sugiro incluir:\n\n• Discussão sobre influências culturais na Idade Média\n• Atividade comparativa entre culturas medievais\n• Reflexão sobre legados culturais',
        'EF09GE02': '📋 O plano não contempla a competência EF09GE02 sobre "análise de processos migratórios". Recomendo adicionar:\n\n• Dados sobre migração campo-cidade\n• Impactos sociais da urbanização\n• Estudo de caso de cidades brasileiras',
      };
      
      (window as any).addAIMessage(explanations[competence] || 'Competência não encontrada.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{LESSON_PLANS.length}</p>
              <p className="text-sm text-muted-foreground">Planos de Aula</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Aderentes à BNCC</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Precisam Revisão</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar BNCC Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Radar BNCC - Planos de Aula
          </CardTitle>
          <CardDescription>
            Clique nas badges vermelhas para ver sugestões de adequação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professor</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Série</TableHead>
                <TableHead>Aderência BNCC</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LESSON_PLANS.map((plan, index) => (
                <TableRow 
                  key={plan.id} 
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${plan.teacher}`} />
                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{plan.teacher}</span>
                    </div>
                  </TableCell>
                  <TableCell>{plan.subject}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{plan.topic}</TableCell>
                  <TableCell>{plan.grade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            plan.bnccScore >= 80 ? 'bg-success' : 
                            plan.bnccScore >= 60 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${plan.bnccScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{plan.bnccScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.status === 'approved' ? (
                      <Badge className="bg-success/10 text-success hover:bg-success/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aderente
                      </Badge>
                    ) : (
                      <Badge 
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer"
                        onClick={() => handleCompetenceClick(plan.missingCompetence)}
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Falta {plan.missingCompetence}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}