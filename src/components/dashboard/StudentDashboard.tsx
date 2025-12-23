import { useState } from 'react';
import { Flame, Star, Trophy, FileText, Calculator, BookOpen, Clock, ArrowLeft, MessageCircle, Video, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const SUBJECTS = [
  { id: 'portugues', name: 'Português', color: 'bg-primary/10 text-primary', icon: FileText },
  { id: 'matematica', name: 'Matemática', color: 'bg-success/10 text-success', icon: Calculator },
  { id: 'historia', name: 'História', color: 'bg-warning/10 text-warning', icon: BookOpen },
  { id: 'biologia', name: 'Biologia', color: 'bg-destructive/10 text-destructive', icon: BookOpen },
];

const SUBJECT_DATA: Record<string, { tasks: any[]; lessons: any[]; discussions: any[] }> = {
  portugues: {
    tasks: [
      { id: 1, title: 'Redação: Tecnologia na Educação', dueDate: '25 Dez', xp: 150 },
      { id: 2, title: 'Interpretação de Texto', dueDate: '28 Dez', xp: 80 },
    ],
    lessons: [
      { id: 1, title: 'Coesão e Coerência', duration: '15 min', type: 'video' },
      { id: 2, title: 'Figuras de Linguagem', duration: '20 min', type: 'video' },
      { id: 3, title: 'Material: Redação ENEM', type: 'pdf' },
    ],
    discussions: [
      { id: 1, author: 'Maria Silva', avatar: 'maria', message: 'Alguém pode me ajudar com a estrutura da redação?', time: '2h atrás' },
      { id: 2, author: 'João Santos', avatar: 'joao', message: 'Como usar conectivos no desenvolvimento?', time: '5h atrás' },
    ],
  },
  matematica: {
    tasks: [
      { id: 1, title: 'Funções do 2º Grau', dueDate: '27 Dez', xp: 100 },
      { id: 2, title: 'Exercícios de Logaritmos', dueDate: '30 Dez', xp: 90 },
    ],
    lessons: [
      { id: 1, title: 'Introdução a Funções', duration: '25 min', type: 'video' },
      { id: 2, title: 'Gráficos de Parábolas', duration: '18 min', type: 'video' },
    ],
    discussions: [
      { id: 1, author: 'Pedro Lima', avatar: 'pedro', message: 'Como encontrar o vértice da parábola?', time: '1h atrás' },
    ],
  },
  historia: {
    tasks: [
      { id: 1, title: 'Quiz: Revolução Industrial', dueDate: '28 Dez', xp: 80 },
    ],
    lessons: [
      { id: 1, title: 'Era das Revoluções', duration: '30 min', type: 'video' },
      { id: 2, title: 'Linha do Tempo: Séc. XVIII', type: 'pdf' },
    ],
    discussions: [
      { id: 1, author: 'Ana Costa', avatar: 'ana', message: 'Qual a diferença entre as fases da Rev. Industrial?', time: '3h atrás' },
    ],
  },
  biologia: {
    tasks: [
      { id: 1, title: 'Ecossistemas Brasileiros', dueDate: '30 Dez', xp: 120 },
    ],
    lessons: [
      { id: 1, title: 'Biomas do Brasil', duration: '22 min', type: 'video' },
      { id: 2, title: 'Cadeias Alimentares', duration: '15 min', type: 'video' },
    ],
    discussions: [
      { id: 1, author: 'Lucas Mendes', avatar: 'lucas', message: 'Quais são as características do Cerrado?', time: '4h atrás' },
    ],
  },
};

export function StudentDashboard() {
  const [selectedActivity, setSelectedActivity] = useState<typeof ACTIVITIES[0] | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
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

  const handleSubjectClick = (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    setSelectedActivity(null);
  };

  // View: Selected Subject with 3 columns
  if (selectedSubject) {
    const subjectData = SUBJECT_DATA[selectedSubject.id];
    const SubjectIcon = selectedSubject.icon;

    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => setSelectedSubject(null)}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Matérias
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${selectedSubject.color}`}>
            <SubjectIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">{selectedSubject.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Tasks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Tarefas</h2>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {subjectData.tasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{task.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">Entrega: {task.dueDate}</Badge>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                          +{task.xp} XP
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Column 2: Lessons & Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-5 h-5 text-success" />
              <h2 className="font-semibold text-lg">Aulas e Conteúdos</h2>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {subjectData.lessons.map((lesson) => (
                  <Card key={lesson.id} className="cursor-pointer hover:border-success/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {lesson.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{lesson.title}</h3>
                          {lesson.duration && (
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Column 3: Discussions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-warning" />
              <h2 className="font-semibold text-lg">Comentários e Dúvidas</h2>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {subjectData.discussions.map((discussion) => (
                  <Card key={discussion.id} className="cursor-pointer hover:border-warning/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${discussion.avatar}`} />
                          <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{discussion.author}</span>
                            <span className="text-xs text-muted-foreground">{discussion.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{discussion.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  // View: Selected Activity (essay)
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

  // Main Dashboard View
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

      {/* Subjects Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Minhas Matérias
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUBJECTS.map((subject, index) => {
            const SubjectIcon = subject.icon;
            return (
              <Card 
                key={subject.id}
                className="cursor-pointer hover:border-primary/50 transition-all hover:scale-105 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleSubjectClick(subject)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className={`p-4 rounded-xl mb-3 ${subject.color}`}>
                    <SubjectIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold">{subject.name}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}