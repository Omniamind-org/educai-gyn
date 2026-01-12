import { useState } from 'react';
import { Flame, Star, Trophy, FileText, Calculator, BookOpen, Clock, ArrowLeft, MessageCircle, Video, Users, LucideIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { STUDENT_ACTIVITIES, SUBJECTS, SUBJECT_DATA, STUDENT_CONTEXT, Activity } from '@/data/studentData';
import { LearningProgressView } from './student/LearningProgressView';
import { ObjectiveSelectionView, StudyObjective } from './student/ObjectiveSelectionView';
import { StudyChatView } from './student/StudyChatView';

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Calculator,
  BookOpen,
};

type StudentView = 'dashboard' | 'progress' | 'objectives' | 'study-chat';

export function StudentDashboard() {
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [selectedObjective, setSelectedObjective] = useState<StudyObjective | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [essayContent, setEssayContent] = useState('');

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    
    // Trigger AI message when essay is opened
    if (activity.type === 'essay' && (window as any).addAIMessage) {
      setTimeout(() => {
        (window as any).addAIMessage(
          `Olá! Vi que você vai trabalhar na atividade "${activity.title}". Quer que eu te ajude com dicas ou analise seu progresso? 📝`
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

  const handleObjectiveSelect = (objective: StudyObjective) => {
    setSelectedObjective(objective);
    setCurrentView('study-chat');
  };

  // View: Study Chat with selected objective
  if (currentView === 'study-chat' && selectedObjective) {
    return (
      <StudyChatView
        objective={selectedObjective}
        onBack={() => {
          setCurrentView('objectives');
          setSelectedObjective(null);
        }}
      />
    );
  }

  // View: Objective Selection
  if (currentView === 'objectives') {
    return (
      <ObjectiveSelectionView
        onBack={() => setCurrentView('progress')}
        onSelectObjective={handleObjectiveSelect}
      />
    );
  }

  // View: Learning Progress
  if (currentView === 'progress') {
    return (
      <LearningProgressView
        onStudyNow={() => setCurrentView('objectives')}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  // View: Selected Subject with tabs
  if (selectedSubject) {
    const subjectData = SUBJECT_DATA[selectedSubject.id];
    const SubjectIcon = iconMap[selectedSubject.icon] || BookOpen;

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

        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${selectedSubject.color}`}>
            <SubjectIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">{selectedSubject.name}</h1>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="tasks" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
            >
              <FileText className="w-4 h-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
            >
              <Video className="w-4 h-4" />
              Conteúdos
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
            >
              <Users className="w-4 h-4" />
              Comentários
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
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
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
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
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
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
          </TabsContent>
        </Tabs>
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
      <div className="p-3 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Avatar className="w-10 h-10 border-2 border-primary shrink-0">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-1 shrink-0">
            <Trophy className="w-4 h-4 text-warning" />
            <span className="font-semibold text-xs">Nível {STUDENT_CONTEXT.level}</span>
          </div>
          
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="text-xs text-muted-foreground shrink-0">XP</span>
            <span className="text-xs font-medium shrink-0">{STUDENT_CONTEXT.xp.toLocaleString()}/2k</span>
            <Progress value={(STUDENT_CONTEXT.xp / 2000) * 100} className="h-1.5 flex-1 min-w-[40px]" />
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Flame className="w-4 h-4 text-destructive" />
            <span className="font-semibold text-xs">{STUDENT_CONTEXT.streak} Dias</span>
          </div>
        </div>
      </div>

      {/* Learning Progress Button */}
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-all group"
        onClick={() => setCurrentView('progress')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Meu Progresso de Aprendizagem</h3>
              <p className="text-muted-foreground text-sm">Acompanhe seu engajamento, sessões e dificuldades</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            Acessar
          </Button>
        </CardContent>
      </Card>

      {/* Pending Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Atividades Pendentes ({STUDENT_ACTIVITIES.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STUDENT_ACTIVITIES.map((activity, index) => (
            <Card 
              key={activity.id}
              className="activity-card opacity-0 animate-fade-in cursor-pointer"
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
            const SubjectIcon = iconMap[subject.icon] || BookOpen;
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
