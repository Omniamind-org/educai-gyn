import { BarChart2, Brain, AlertTriangle, ArrowLeft, GraduationCap, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: string;
}

interface LearningProgressViewProps {
  onStudyNow: () => void;
  onBack: () => void;
  onActivityClick?: (activity: Activity) => void;
}

const RECENT_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'quero aprender o que é uma pla...',
    type: 'CONCEPT',
    date: '08/01/2026',
    duration: '2 min',
  },
  {
    id: '2',
    title: 'Revisão de frações e decimais',
    type: 'PRACTICE',
    date: '07/01/2026',
    duration: '15 min',
  },
  {
    id: '3',
    title: 'Diagnóstico de Matemática',
    type: 'DIAGNOSTIC',
    date: '06/01/2026',
    duration: '10 min',
  },
];

export function LearningProgressView({ onStudyNow, onBack, onActivityClick }: LearningProgressViewProps) {
  const stats = {
    engagement: 'Bom Ritmo',
    engagementSubtext: '1 dias sem sessões registradas.',
    sessionsCompleted: 1,
    difficultiesMapped: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">
                Educ <span className="text-primary">AI</span> Aluno
              </h1>
              <p className="text-muted-foreground">Meu Progresso de Aprendizagem</p>
            </div>
          </div>
        </div>
        <Button onClick={onStudyNow} className="gap-2 bg-primary hover:bg-primary/90">
          <Sparkles className="w-4 h-4" />
          Estudar Agora
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Engagement Card */}
        <Card className="border-success bg-success/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-success font-medium">Meu Engajamento</span>
              <BarChart2 className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-success mb-1">{stats.engagement}</h3>
            <p className="text-sm text-muted-foreground">{stats.engagementSubtext}</p>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground font-medium">Sessões Concluídas</span>
              <Brain className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-4xl font-bold mb-1">{stats.sessionsCompleted}</h3>
            <p className="text-sm text-muted-foreground">Continue assim para manter o ritmo!</p>
          </CardContent>
        </Card>

        {/* Difficulties Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground font-medium">Dificuldades Mapeadas</span>
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-4xl font-bold mb-1">{stats.difficultiesMapped}</h3>
            <p className="text-sm text-muted-foreground">Pontos que o tutor está te ajudando</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Minhas Últimas Atividades</h2>
          <div className="space-y-3">
            {RECENT_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-l-4 border-success pl-4 hover:bg-muted/50 rounded-r-lg cursor-pointer transition-colors"
                onClick={() => onActivityClick?.(activity)}
              >
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <span className="text-xs text-success uppercase">{activity.type}</span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{activity.duration}</p>
                  <p>{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
