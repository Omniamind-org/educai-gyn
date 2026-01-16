import { useState } from 'react';
import { Flame, Star, Trophy, FileText, Calculator, BookOpen, Clock, ArrowLeft, MessageCircle, Video, Users, LucideIcon, TrendingUp, Loader2, FileDown, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { STUDENT_CONTEXT } from '@/data/studentData';
import { LearningProgressView } from './student/LearningProgressView';
import { ObjectiveSelectionView, StudyObjective } from './student/ObjectiveSelectionView';
import { StudyChatView } from './student/StudyChatView';
import { useStudentTasks, StudentTask } from '@/hooks/useStudentTasks';
import { useStudentSubjects, StudentSubject } from '@/hooks/useStudentSubjects';

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Calculator,
  BookOpen,
};

type StudentView = 'dashboard' | 'progress' | 'objectives' | 'study-chat';

export function StudentDashboard() {
  const { tasks, loading: tasksLoading } = useStudentTasks();
  const { subjects, loading: subjectsLoading } = useStudentSubjects();
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [selectedObjective, setSelectedObjective] = useState<StudyObjective | null>(null);
  const [selectedTask, setSelectedTask] = useState<StudentTask | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(null);
  const [responseContent, setResponseContent] = useState('');

  const handleTaskClick = (task: StudentTask) => {
    setSelectedTask(task);

    // Trigger AI message when task is opened
    if ((window as any).addAIMessage) {
      setTimeout(() => {
        (window as any).addAIMessage(
          `Olá! Vi que você vai trabalhar na atividade "${task.title}". Quer que eu te ajude com dicas ou analise seu progresso? 📝`
        );
      }, 500);
    }
  };

  const handleGrammarCheck = () => {
    if ((window as any).addAIMessage) {
      (window as any).addAIMessage(
        '🔍 Analisando seu texto... Encontrei algumas sugestões:\n\n• Considere revisar a estrutura do texto\n• Verifique a coesão entre os parágrafos\n• Boa organização! Continue assim!'
      );
    }
  };

  const handleSubjectClick = (subject: StudentSubject) => {
    setSelectedSubject(subject);
    setSelectedTask(null);
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

  // Filter tasks by selected subject's teacher
  const getSubjectTasks = () => {
    if (!selectedSubject) return [];
    return tasks.filter(task => task.teacherName === selectedSubject.teacherName);
  };

  // View: Selected Subject with tabs
  if (selectedSubject) {
    const SubjectIcon = iconMap[selectedSubject.icon] || BookOpen;
    const subjectTasks = getSubjectTasks();

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
          <div>
            <h1 className="text-2xl font-bold">{selectedSubject.name}</h1>
            <p className="text-sm text-muted-foreground">Prof. {selectedSubject.teacherName}</p>
          </div>
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
              {subjectTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tarefa pendente nesta matéria</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subjectTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {
                        setSelectedSubject(null);
                        handleTaskClick(task);
                      }}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">{task.title}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">Entrega: {task.dueDate}</Badge>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            Nota: {task.maxScore}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
              <div className="text-center py-8 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Conteúdos em breve</p>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Comentários em breve</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // View: Selected Task
  if (selectedTask) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => setSelectedTask(null)}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Atividades
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                  {selectedTask.className}
                </Badge>
                <CardTitle className="text-xl">{selectedTask.title}</CardTitle>
                {selectedTask.description && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedTask.description}</p>
                )}
              </div>
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3" />
                Nota máx: {selectedTask.maxScore}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Escreva sua resposta aqui..."
              className="min-h-[300px] resize-none"
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={handleGrammarCheck} variant="outline" className="gap-2">
                🔍 Revisar Texto
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
          Atividades Pendentes ({tasks.length})
        </h2>

        {tasksLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando tarefas...</span>
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Nenhuma tarefa pendente</h3>
              <p className="text-muted-foreground">
                Você está em dia! Novas tarefas aparecerão aqui quando seus professores as criarem.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task, index) => (
              <Card
                key={task.id}
                className="activity-card opacity-0 animate-fade-in cursor-pointer hover:border-primary/50 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{task.className}</span>
                        <Badge variant="outline" className="text-xs">
                          Entrega: {task.dueDate}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Nota: {task.maxScore}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Subjects Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Minhas Matérias
        </h2>

        {subjectsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando matérias...</span>
          </div>
        ) : subjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Nenhuma matéria disponível</h3>
              <p className="text-muted-foreground">
                Suas matérias aparecerão aqui quando você for matriculado em uma turma.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((subject, index) => {
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
                    <p className="text-xs text-muted-foreground mt-1">Prof. {subject.teacherName}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
