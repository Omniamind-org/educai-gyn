import { useState } from 'react';
import { Users, Plus, Lightbulb, BookOpen, Target, Calendar, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentProgressAnalysis } from './teacher/StudentProgressAnalysis';

const CLASSES = [
  { id: 1, name: '3º Ano A', students: 28, subject: 'História', nextClass: 'Hoje, 14h' },
  { id: 2, name: '2º Ano B', students: 32, subject: 'História', nextClass: 'Amanhã, 10h' },
  { id: 3, name: '1º Ano C', students: 30, subject: 'História', nextClass: 'Quarta, 8h' },
];

const SERIES = ['1º Ano', '2º Ano', '3º Ano'];
const BNCC_OBJECTIVES = [
  'EF09HI01 - Compreender o processo de industrialização',
  'EF09HI02 - Analisar transformações sociais',
  'EF09HI03 - Identificar impactos ambientais',
];

type TeacherView = 'dashboard' | 'progress-analysis';

export function TeacherDashboard() {
  const [currentView, setCurrentView] = useState<TeacherView>('dashboard');
  const [lessonTopic, setLessonTopic] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBncc, setSelectedBncc] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CLASSES.map((cls, index) => (
            <Card 
              key={cls.id}
              className="activity-card opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-success/10">
                    <BookOpen className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">{cls.subject}</p>
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
                    <span className="text-muted-foreground">{cls.students} alunos</span>
                  </div>
                  
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {cls.nextClass}
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