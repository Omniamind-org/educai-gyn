import { useState } from 'react';
import { Lightbulb, Plus, ListChecks, Loader2, FolderOpen, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SERIES, BNCC_AREAS, BNCC_SKILLS } from '@/constants';

interface TeacherAgentMakerProps {
  onPlanGenerated: (plan: any) => void;
  onExerciseListGenerated: (list: any) => void;
  onViewSavedPlans: () => void;
  onViewSavedLists: () => void;
  onViewInteractiveResources: () => void;
}

export function TeacherAgentMaker({ 
  onPlanGenerated, 
  onExerciseListGenerated,
  onViewSavedPlans,
  onViewSavedLists,
  onViewInteractiveResources 
}: TeacherAgentMakerProps) {
  const { toast } = useToast();
  const [lessonTopic, setLessonTopic] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedBncc, setSelectedBncc] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingExercises, setIsGeneratingExercises] = useState(false);

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

      if (response.error) throw new Error(response.error.message || 'Erro ao gerar plano de aula');

      const data = response.data;
      if (data.error) {
        toast({
          title: 'Erro',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Plano gerado!',
        description: 'O plano de aula foi gerado com sucesso.',
      });

      onPlanGenerated({
        content: data.lessonPlan,
        topic: lessonTopic,
        series: selectedSeries,
        bnccObjective: selectedBncc,
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

      if (response.error) throw new Error(response.error.message || 'Erro ao gerar lista de exercícios');

      const data = response.data;
      if (data.error) {
        toast({
          title: 'Erro',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Lista gerada!',
        description: 'A lista de exercícios foi gerada com sucesso.',
      });

      onExerciseListGenerated({
        content: data.exerciseList,
        topic: lessonTopic,
        series: selectedSeries,
        bnccObjective: selectedBncc,
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

  return (
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

        <div className="flex gap-3 flex-wrap">
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
            onClick={onViewSavedPlans}
          >
            <FolderOpen className="w-4 h-4" />
            Planos Salvos
          </Button>
          <Button 
            variant="secondary" 
            className="gap-2"
            onClick={onViewSavedLists}
          >
            <FolderOpen className="w-4 h-4" />
            Listas Salvas
          </Button>
          <Button 
            variant="secondary" 
            className="gap-2"
            onClick={onViewInteractiveResources}
          >
            <Gamepad2 className="w-4 h-4" />
            Recursos Interativos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
