import { useState, useEffect } from 'react';
import { Users, Plus, Lightbulb, BookOpen, ListChecks, Calendar, BarChart2, Loader2, FolderOpen, Save } from 'lucide-react';
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
import { LessonPlanEditor } from './teacher/LessonPlanEditor';
import { SavedLessonPlansView } from './teacher/SavedLessonPlansView';
import { ExerciseListEditor } from './teacher/ExerciseListEditor';
import { SavedExerciseListsView } from './teacher/SavedExerciseListsView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClassWithDetails {
  id: string;
  name: string;
  grade: string;
  year: number;
  student_count: number;
}

interface GeneratedLessonPlan {
  id?: string;
  content: string;
  topic: string;
  series: string;
  bnccObjective: string;
}

interface GeneratedExerciseList {
  id?: string;
  content: string;
  topic: string;
  series: string;
  bnccObjective: string;
}

const SERIES = ['1º Ano do Ensino Médio', '2º Ano do Ensino Médio', '3º Ano do Ensino Médio'];

const BNCC_AREAS = [
  { id: 'matematica', name: 'Matemática e suas tecnologias' },
  { id: 'linguagens', name: 'Linguagens e suas tecnologias' },
  { id: 'ciencias_humanas', name: 'Ciências humanas e suas tecnologias' },
  { id: 'ciencias_natureza', name: 'Ciências da natureza e suas tecnologias' },
];

const BNCC_SKILLS: Record<string, { code: string; description: string }[]> = {
  matematica: [
    // Competência Específica 1
    { code: 'EM13MAT101', description: 'Interpretar situações econômicas, sociais e das Ciências da Natureza que envolvem a variação de duas grandezas, pela análise dos gráficos das funções representadas e das taxas de variação, com ou sem apoio de tecnologias digitais.' },
    { code: 'EM13MAT102', description: 'Analisar gráficos e métodos de amostragem de pesquisas estatísticas divulgadas por diferentes meios de comunicação, identificando inadequações que possam induzir a erros de interpretação, como escalas e amostras não apropriadas.' },
    { code: 'EM13MAT103', description: 'Interpretar o emprego de unidades de medida de diferentes grandezas, inclusive novas unidades como as de armazenamento de dados e distâncias astronômicas e microscópicas.' },
    { code: 'EM13MAT104', description: 'Interpretar taxas e índices de natureza socioeconômica, como índice de desenvolvimento humano e taxas de inflação, investigando seus processos de cálculo.' },
    { code: 'EM13MAT105', description: 'Utilizar transformações isométricas e homotéticas para analisar produções humanas como construções civis e obras de arte.' },
    // Competência Específica 2
    { code: 'EM13MAT201', description: 'Propor ações comunitárias envolvendo cálculos de área, volume, capacidade ou massa adequados às demandas da região.' },
    { code: 'EM13MAT202', description: 'Planejar e executar pesquisa amostral sobre questões relevantes, comunicando resultados por meio de gráficos e medidas estatísticas.' },
    { code: 'EM13MAT203', description: 'Planejar e executar ações envolvendo aplicativos, jogos, planilhas e simuladores para aplicar conceitos matemáticos e tomar decisões.' },
    // Competência Específica 3
    { code: 'EM13MAT301', description: 'Resolver e elaborar problemas com equações lineares simultâneas.' },
    { code: 'EM13MAT302', description: 'Resolver e elaborar problemas com funções polinomiais de 1º e 2º graus.' },
    { code: 'EM13MAT303', description: 'Resolver e elaborar problemas envolvendo porcentagens e juros compostos.' },
    { code: 'EM13MAT304', description: 'Resolver e elaborar problemas com funções exponenciais.' },
    { code: 'EM13MAT305', description: 'Resolver e elaborar problemas com funções logarítmicas.' },
    { code: 'EM13MAT306', description: 'Resolver e elaborar problemas envolvendo fenômenos periódicos e funções seno e cosseno.' },
    { code: 'EM13MAT307', description: 'Empregar métodos para obtenção da área de superfícies e deduzir expressões de cálculo.' },
    { code: 'EM13MAT308', description: 'Resolver e elaborar problemas com triângulos envolvendo congruência e semelhança.' },
    { code: 'EM13MAT309', description: 'Resolver e elaborar problemas envolvendo áreas e volumes de sólidos geométricos.' },
    { code: 'EM13MAT310', description: 'Resolver e elaborar problemas de contagem usando princípios aditivo e multiplicativo.' },
    { code: 'EM13MAT311', description: 'Resolver e elaborar problemas de probabilidade de eventos aleatórios.' },
    { code: 'EM13MAT312', description: 'Resolver e elaborar problemas de probabilidade em experimentos sucessivos.' },
    { code: 'EM13MAT313', description: 'Resolver e elaborar problemas envolvendo algarismos significativos e notação científica.' },
    { code: 'EM13MAT314', description: 'Resolver e elaborar problemas envolvendo grandezas compostas como velocidade e densidade.' },
    { code: 'EM13MAT315', description: 'Reconhecer e expressar problemas algorítmicos por meio de algoritmos e fluxogramas.' },
    { code: 'EM13MAT316', description: 'Resolver e elaborar problemas envolvendo média, moda, mediana, variância e desvio padrão.' },
    // Competência Específica 4
    { code: 'EM13MAT401', description: 'Converter funções polinomiais de 1º grau da forma algébrica para a gráfica.' },
    { code: 'EM13MAT402', description: 'Converter funções polinomiais de 2º grau da forma algébrica para a gráfica.' },
    { code: 'EM13MAT403', description: 'Comparar funções exponenciais e logarítmicas em gráficos.' },
    { code: 'EM13MAT404', description: 'Identificar características das funções seno e cosseno.' },
    { code: 'EM13MAT405', description: 'Reconhecer funções definidas por tabelas e sentenças como contas de consumo.' },
    { code: 'EM13MAT406', description: 'Utilizar conceitos básicos de programação para implementar algoritmos.' },
    { code: 'EM13MAT407', description: 'Interpretar vistas ortogonais de figuras espaciais.' },
    { code: 'EM13MAT408', description: 'Construir e interpretar tabelas e gráficos estatísticos.' },
    { code: 'EM13MAT409', description: 'Interpretar e comparar dados por meio de histogramas, box-plot e outros gráficos.' },
    // Competência Específica 5
    { code: 'EM13MAT501', description: 'Investigar relações em tabelas e representá-las no plano cartesiano como função de 1º grau.' },
    { code: 'EM13MAT502', description: 'Investigar relações em tabelas como função de 2º grau.' },
    { code: 'EM13MAT503', description: 'Investigar pontos de máximo e mínimo de funções quadráticas.' },
    { code: 'EM13MAT504', description: 'Investigar o cálculo de volumes de sólidos geométricos.' },
    { code: 'EM13MAT505', description: 'Resolver problemas de ladrilhamentos do plano.' },
    { code: 'EM13MAT506', description: 'Representar a variação da área e do perímetro de polígonos regulares.' },
    { code: 'EM13MAT507', description: 'Associar progressões aritméticas a funções afins.' },
    { code: 'EM13MAT508', description: 'Associar progressões geométricas a funções exponenciais.' },
    { code: 'EM13MAT509', description: 'Investigar projeções cartográficas.' },
    { code: 'EM13MAT510', description: 'Investigar a relação entre duas variáveis usando tecnologias.' },
    { code: 'EM13MAT511', description: 'Investigar diferentes espaços amostrais e suas implicações na probabilidade.' },
    { code: 'EM13MAT512', description: 'Investigar propriedades de figuras geométricas por meio de conjecturas e contraexemplos.' },
  ],
  linguagens: [],
  ciencias_humanas: [],
  ciencias_natureza: [],
};

type TeacherView = 'dashboard' | 'progress-analysis' | 'class-detail' | 'lesson-plan-editor' | 'saved-plans' | 'exercise-list-editor' | 'saved-exercise-lists';

export function TeacherDashboard() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<TeacherView>('dashboard');
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [lessonTopic, setLessonTopic] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedBncc, setSelectedBncc] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingExercises, setIsGeneratingExercises] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [generatedExerciseList, setGeneratedExerciseList] = useState<GeneratedExerciseList | null>(null);

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

  const handleGenerateLessonPlan = async () => {
    if (!lessonTopic.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe o tema da aula.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPlan(true);

    try {
      const response = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          topic: lessonTopic,
          series: selectedSeries,
          bnccObjective: selectedBncc,
          description: lessonDescription,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar plano de aula');
      }

      const data = response.data;

      if (data.error) {
        toast({
          title: 'Erro',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      // Store the generated plan and open editor
      setGeneratedPlan({
        content: data.lessonPlan,
        topic: lessonTopic,
        series: selectedSeries,
        bnccObjective: selectedBncc,
      });
      setCurrentView('lesson-plan-editor');

      toast({
        title: 'Plano gerado!',
        description: 'O plano de aula foi gerado com sucesso.',
      });

      // Clear form
      setLessonTopic('');
      setSelectedSeries('');
      setSelectedArea('');
      setSelectedBncc('');
      setLessonDescription('');
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível gerar o plano de aula.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateExerciseList = async () => {
    if (!lessonTopic.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe o tema.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingExercises(true);

    try {
      const response = await supabase.functions.invoke('generate-exercise-list', {
        body: {
          topic: lessonTopic,
          series: selectedSeries,
          bnccObjective: selectedBncc,
          description: lessonDescription,
          exerciseCount: 10,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar lista de exercícios');
      }

      const data = response.data;

      if (data.error) {
        toast({
          title: 'Erro',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      // Store the generated list and open editor
      setGeneratedExerciseList({
        content: data.exerciseList,
        topic: lessonTopic,
        series: selectedSeries,
        bnccObjective: selectedBncc,
      });
      setCurrentView('exercise-list-editor');

      toast({
        title: 'Lista gerada!',
        description: 'A lista de exercícios foi gerada com sucesso.',
      });

      // Clear form
      setLessonTopic('');
      setSelectedSeries('');
      setSelectedArea('');
      setSelectedBncc('');
      setLessonDescription('');
    } catch (error) {
      console.error('Error generating exercise list:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível gerar a lista de exercícios.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingExercises(false);
    }
  };

  // Show Saved Exercise Lists View
  if (currentView === 'saved-exercise-lists' && teacherId) {
    return (
      <SavedExerciseListsView
        teacherId={teacherId}
        onBack={() => setCurrentView('dashboard')}
        onOpenList={(list) => {
          setGeneratedExerciseList({
            id: list.id,
            content: list.content,
            topic: list.topic,
            series: list.series || '',
            bnccObjective: list.bncc_objective || '',
          });
          setCurrentView('exercise-list-editor');
        }}
      />
    );
  }

  // Show Exercise List Editor
  if (currentView === 'exercise-list-editor' && generatedExerciseList) {
    return (
      <ExerciseListEditor
        listId={generatedExerciseList.id}
        exerciseList={generatedExerciseList.content}
        topic={generatedExerciseList.topic}
        series={generatedExerciseList.series}
        bnccObjective={generatedExerciseList.bnccObjective}
        teacherId={teacherId}
        onBack={() => {
          setCurrentView('saved-exercise-lists');
          setGeneratedExerciseList(null);
        }}
        onSaved={(id) => {
          setGeneratedExerciseList(prev => prev ? { ...prev, id } : null);
        }}
      />
    );
  }

  // Show Saved Lesson Plans View
  if (currentView === 'saved-plans' && teacherId) {
    return (
      <SavedLessonPlansView
        teacherId={teacherId}
        onBack={() => setCurrentView('dashboard')}
        onOpenPlan={(plan) => {
          setGeneratedPlan({
            id: plan.id,
            content: plan.content,
            topic: plan.topic,
            series: plan.series || '',
            bnccObjective: plan.bncc_objective || '',
          });
          setCurrentView('lesson-plan-editor');
        }}
      />
    );
  }

  // Show Lesson Plan Editor
  if (currentView === 'lesson-plan-editor' && generatedPlan) {
    return (
      <LessonPlanEditor
        planId={generatedPlan.id}
        lessonPlan={generatedPlan.content}
        topic={generatedPlan.topic}
        series={generatedPlan.series}
        bnccObjective={generatedPlan.bnccObjective}
        teacherId={teacherId}
        onBack={() => {
          setCurrentView('saved-plans');
          setGeneratedPlan(null);
        }}
        onSaved={(id) => {
          setGeneratedPlan(prev => prev ? { ...prev, id } : null);
        }}
      />
    );
  }

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área do Conhecimento</Label>
              <Select value={selectedArea} onValueChange={(value) => {
                setSelectedArea(value);
                setSelectedBncc('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {BNCC_AREAS.map((area) => (
                    <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bncc">Habilidade BNCC</Label>
              <Select 
                value={selectedBncc} 
                onValueChange={setSelectedBncc}
                disabled={!selectedArea || BNCC_SKILLS[selectedArea]?.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedArea 
                      ? "Selecione uma área primeiro" 
                      : BNCC_SKILLS[selectedArea]?.length === 0 
                        ? "Em breve" 
                        : "Selecione a habilidade"
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {selectedArea && BNCC_SKILLS[selectedArea]?.map((skill) => (
                    <SelectItem 
                      key={skill.code} 
                      value={`${skill.code} - ${skill.description}`}
                      className="max-w-[500px]"
                    >
                      <span className="font-medium">{skill.code}</span>
                      <span className="text-muted-foreground ml-1 text-xs truncate">
                        - {skill.description.length > 60 ? skill.description.substring(0, 60) + '...' : skill.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <Button 
              className="gap-2" 
              onClick={handleGenerateLessonPlan}
              disabled={isGeneratingPlan}
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Gerar Plano de Aula
                </>
              )}
            </Button>
            <Button 
              className="gap-2"
              onClick={handleGenerateExerciseList}
              disabled={isGeneratingExercises}
            >
              {isGeneratingExercises ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ListChecks className="w-4 h-4" />
                  Criar Lista de Exercícios
                </>
              )}
            </Button>
            <Button 
              variant="secondary" 
              className="gap-2"
              onClick={() => setCurrentView('saved-plans')}
            >
              <FolderOpen className="w-4 h-4" />
              Planos Salvos
            </Button>
            <Button 
              variant="secondary" 
              className="gap-2"
              onClick={() => setCurrentView('saved-exercise-lists')}
            >
              <FolderOpen className="w-4 h-4" />
              Listas Salvas
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
