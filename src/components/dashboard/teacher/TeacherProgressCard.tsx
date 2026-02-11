import { BarChart2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TeacherProgressCardProps {
  onClick: () => void;
}

export function TeacherProgressCard({ onClick }: TeacherProgressCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all group"
      onClick={onClick}
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
  );
}
