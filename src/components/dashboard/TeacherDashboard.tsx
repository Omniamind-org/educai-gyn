import { useState, useEffect } from 'react';
import { Users, Plus, Lightbulb, BookOpen, Target, Calendar, BarChart2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentProgressAnalysis } from './teacher/StudentProgressAnalysis';
import { ClassDetailView } from './teacher/ClassDetailView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClassWithDetails {
  id: string;
  name: string;
  grade: string;
  year: number;
  student_count: number;
}

const SERIES = ['1º Ano', '2º Ano', '3º Ano'];
const BNCC_OBJECTIVES = [
  'EF09HI01 - Compreender o processo de industrialização',
  'EF09HI02 - Analisar transformações sociais',
  'EF09HI03 - Identificar impactos ambientais',
];

type TeacherView = 'dashboard' | 'progress-analysis' | 'class-detail';

export function TeacherDashboard() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<TeacherView>('dashboard');
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [lessonTopic, setLessonTopic] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBncc, setSelectedBncc] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get teacher record
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!teacherData) {
        setIsLoading(false);
        return;
      }

      setTeacherId(teacherData.id);

      // Get classes assigned to this teacher
      const { data: classTeacherData } = await supabase
        .from('class_teachers')
        .select('class_id')
        .eq('teacher_id', teacherData.id);

      if (!classTeacherData || classTeacherData.length === 0) {
        setClasses([]);
        setIsLoading(false);
        return;
      }

      const classIds = classTeacherData.map(ct => ct.class_id);

      // Get class details
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .in('id', classIds);

      if (!classesData) {
        setClasses([]);
        setIsLoading(false);
        return;
      }

      // Get student counts for each class
      const classesWithCounts = await Promise.all(
        classesData.map(async (cls) => {
          const { count } = await supabase
            .from('class_students')
            .select('id', { count: 'exact' })
            .eq('class_id', cls.id);
          
          return {
            ...cls,
            student_count: count || 0,
          };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas turmas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicChange = (value: string) => {
    setLessonTopic(value);
    
    // Trigger AI suggestion when typing about specific topics
    if (value.toLowerCase().includes('revolução industrial') && (window as any).addAIMessage) {
      setTimeout(() => {
        (window as any).addAIMessage(
          '💡 Dica: Posso criar um Quiz gamificado sobre máquinas a vapor para sua aula sobre Revolução Industrial. Quer gerar agora?'
        );
      }, 1000);
    }
  };

  // Show Class Detail View
  if (currentView === 'class-detail' && selectedClass && teacherId) {
    return (
      <ClassDetailView
        classData={selectedClass}
        teacherId={teacherId}
        onBack={() => {
          setCurrentView('dashboard');
          setSelectedClass(null);
        }}
      />
    );
  }

  // Show Progress Analysis View
  if (currentView === 'progress-analysis') {
    return (
      <StudentProgressAnalysis
        onBack={() => setCurrentView('dashboard')}
        onStartPlanning={() => {
          // Trigger AI message for planning
          if ((window as any).addAIMessage) {
            (window as any).addAIMessage(
              '🎯 Vamos criar um plano pedagógico personalizado! Me conte: qual é o tema que você quer trabalhar e para qual turma? Posso sugerir atividades, trilhas de aprendizagem e materiais adaptados.'
            );
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Analysis Card */}
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-all group"
        onClick={() => setCurrentView('progress-analysis')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground transition-colors">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Análise de Progresso dos Alunos</h3>
              <p className="text-muted-foreground text-sm">Monitore sessões, alertas de risco e fluxo de atividades</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            Acessar
          </Button>
        </CardContent>
      </Card>

      {/* Agent Maker Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Criador de Aulas com IA
          </CardTitle>
          <CardDescription>
            Preencha os campos e deixe a IA ajudar a criar conteúdo personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tema da Aula</Label>
              <Input
                id="topic"
                placeholder="Ex: Revolução Industrial"
                value={lessonTopic}
                onChange={(e) => handleTopicChange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="series">Série</Label>
              <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a série" />
                </SelectTrigger>
                <SelectContent>
                  {SERIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bncc">Objetivo BNCC</Label>
            <Select value={selectedBncc} onValueChange={setSelectedBncc}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                {BNCC_OBJECTIVES.map((obj) => (
                  <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Adicional</Label>
            <Textarea
              id="description"
              placeholder="Descreva objetivos específicos ou requisitos da aula..."
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Gerar Plano de Aula
            </Button>
            <Button variant="outline" className="gap-2">
              <Target className="w-4 h-4" />
              Criar Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Minhas Turmas
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma turma atribuída</p>
              <p className="text-sm">A secretaria ainda não atribuiu turmas para você.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((cls, index) => (
              <Card 
                key={cls.id}
                className="activity-card opacity-0 animate-fade-in cursor-pointer hover:border-primary/50 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  setSelectedClass(cls);
                  setCurrentView('class-detail');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-success/10">
                      <BookOpen className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">{cls.grade}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-card">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${cls.id}${i}`} />
                            <AvatarFallback>A</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-muted-foreground">{cls.student_count} alunos</span>
                    </div>
                    
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {cls.year}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
