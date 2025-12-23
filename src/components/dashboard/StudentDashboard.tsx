import { useState } from 'react';
import { Flame, Star, Trophy, FileText, Calculator, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ACTIVITIES = [
  {
    id: 1,
    title: 'Redação: O Papel da Tecnologia na Educação',
    subject: 'Português',
    dueDate: '25 Dez',
    type: 'essay',
    xp: 150,
  },
  {
    id: 2,
    title: 'Funções do 2º Grau',
    subject: 'Matemática',
    dueDate: '27 Dez',
    type: 'exercise',
    xp: 100,
  },
  {
    id: 3,
    title: 'Revolução Industrial',
    subject: 'História',
    dueDate: '28 Dez',
    type: 'quiz',
    xp: 80,
  },
  {
    id: 4,
    title: 'Ecossistemas Brasileiros',
    subject: 'Biologia',
    dueDate: '30 Dez',
    type: 'exercise',
    xp: 120,
  },
];

export function StudentDashboard() {
  const [selectedActivity, setSelectedActivity] = useState<typeof ACTIVITIES[0] | null>(null);
  const [essayContent, setEssayContent] = useState('');

  const handleActivityClick = (activity: typeof ACTIVITIES[0]) => {
    setSelectedActivity(activity);
    
    // Trigger AI message when essay is opened
    if (activity.type === 'essay' && (window as any).addAIMessage) {
      setTimeout(() => {
        (window as any).addAIMessage(
          'Olá! Vi que você vai escrever sobre "O Papel da Tecnologia na Educação". Quer que eu analise a coesão do seu texto enquanto você escreve? Posso dar dicas sem revelar as respostas! 📝'
        );
      }, 500);
    }
  };

  const handleGrammarCheck = () => {
    if ((window as any).addAIMessage) {
      (window as any).addAIMessage(
        '🔍 Analisando seu texto... Encontrei algumas sugestões:\n\n• Parágrafo 2: considere usar conectivos para melhor fluidez\n• Revise a concordância verbal na linha 3\n• Boa estrutura argumentativa! Continue assim!'
      );
    }
  };

  if (selectedActivity) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="gap-2 mb-4"
          onClick={() => setSelectedActivity(null)}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Atividades
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                  {selectedActivity.subject}
                </Badge>
                <CardTitle className="text-xl">{selectedActivity.title}</CardTitle>
              </div>
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3" />
                +{selectedActivity.xp} XP
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Comece a escrever sua redação aqui..."
              className="min-h-[300px] resize-none"
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={handleGrammarCheck} variant="outline" className="gap-2">
                🔍 Corrigir Gramática (Sem dar a resposta)
              </Button>
              <Button className="gap-2">
                Enviar Atividade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gamification Stats */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
        <Avatar className="w-12 h-12 border-2 border-primary">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            <span className="font-semibold">Nível 5</span>
          </div>
          
          <div className="flex-1 max-w-[200px]">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">XP</span>
              <span className="font-medium">1.250 / 2.000</span>
            </div>
            <Progress value={62.5} className="h-2" />
          </div>
          
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-destructive" />
            <span className="font-semibold">12 Dias</span>
            <span className="text-sm text-muted-foreground">de sequência</span>
          </div>
        </div>
      </div>

      {/* Pending Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Atividades Pendentes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTIVITIES.map((activity, index) => (
            <Card 
              key={activity.id}
              className="activity-card opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleActivityClick(activity)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    activity.type === 'essay' ? 'bg-primary/10 text-primary' :
                    activity.type === 'exercise' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {activity.type === 'essay' ? <FileText className="w-5 h-5" /> :
                     activity.type === 'exercise' ? <Calculator className="w-5 h-5" /> :
                     <BookOpen className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{activity.title}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{activity.subject}</span>
                      <Badge variant="outline" className="text-xs">
                        Entrega: {activity.dueDate}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    +{activity.xp} XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}