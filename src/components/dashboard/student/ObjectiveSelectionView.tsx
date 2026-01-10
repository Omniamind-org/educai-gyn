import { ArrowLeft, ClipboardList, BookOpen, Target, RefreshCw, Sparkles, FlaskConical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type StudyObjective = 'diagnostic' | 'concept' | 'practice' | 'review';

interface ObjectiveSelectionViewProps {
  onBack: () => void;
  onSelectObjective: (objective: StudyObjective) => void;
}

const OBJECTIVES = [
  {
    id: 'diagnostic' as StudyObjective,
    title: 'Diagnóstico Rápido',
    description: 'Mini-avaliação para descobrir seu nível atual.',
    icon: ClipboardList,
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
  },
  {
    id: 'concept' as StudyObjective,
    title: 'Entender Conceito',
    description: 'Explicações guiadas passo-a-passo.',
    icon: BookOpen,
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    iconColor: 'text-success',
    titleColor: 'text-success',
  },
  {
    id: 'practice' as StudyObjective,
    title: 'Praticar',
    description: 'Exercícios curtos com feedback imediato.',
    icon: Target,
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    iconColor: 'text-warning',
    titleColor: 'text-warning',
  },
  {
    id: 'review' as StudyObjective,
    title: 'Revisão',
    description: 'Relembrar pontos chave para não esquecer.',
    icon: RefreshCw,
    bgColor: 'bg-secondary',
    borderColor: 'border-border',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
  },
];

export function ObjectiveSelectionView({ onBack, onSelectObjective }: ObjectiveSelectionViewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Painel
        </Button>
      </div>

      {/* Mascot & Title */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <FlaskConical className="w-14 h-14 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Qual é o seu objetivo agora?</h1>
        <p className="text-muted-foreground">Selecione como posso te ajudar a estudar hoje.</p>
      </div>

      {/* Objective Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {OBJECTIVES.map((objective) => {
          const Icon = objective.icon;
          return (
            <Card
              key={objective.id}
              className={`cursor-pointer transition-all hover:scale-105 ${objective.bgColor} ${objective.borderColor} border-2`}
              onClick={() => onSelectObjective(objective.id)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`p-4 rounded-xl bg-background/50 mb-4`}>
                  <Icon className={`w-8 h-8 ${objective.iconColor}`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${objective.titleColor}`}>
                  {objective.title}
                </h3>
                <p className="text-muted-foreground text-sm">{objective.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
