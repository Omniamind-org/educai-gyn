import { SchoolUnit } from '@/data/regionalData';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolsTableViewProps {
  schools: SchoolUnit[];
  onSelectSchool: (school: SchoolUnit) => void;
}

export function SchoolsTableView({ schools, onSelectSchool }: SchoolsTableViewProps) {
  const getRiskBadge = (level: SchoolUnit['riskLevel']) => {
    switch (level) {
      case 'stable':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">REGULAR</Badge>;
      case 'alert':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0">ATENÇÃO ALTA</Badge>;
      case 'critical':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">CRÍTICO</Badge>;
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 85) return 'bg-success';
    if (value >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <div className="col-span-4">Unidade</div>
        <div className="col-span-2 text-center">Alunos</div>
        <div className="col-span-3 text-center">Permanência</div>
        <div className="col-span-2 text-center">Nível de Atenção</div>
        <div className="col-span-1 text-center">Ação</div>
      </div>
      
      <div className="divide-y divide-border">
        {schools.map((school) => (
          <div
            key={school.id}
            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={() => onSelectSchool(school)}
          >
            <div className="col-span-4">
              <h4 className="font-semibold text-foreground">{school.name}</h4>
              <p className="text-xs text-muted-foreground">{school.region}</p>
            </div>
            <div className="col-span-2 text-center font-medium">
              {school.totalStudents}
            </div>
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Progress 
                    value={school.permanence} 
                    className="h-2"
                    style={{ 
                      '--progress-background': getProgressColor(school.permanence)
                    } as React.CSSProperties}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{school.permanence}%</span>
              </div>
            </div>
            <div className="col-span-2 text-center">
              {getRiskBadge(school.riskLevel)}
            </div>
            <div className="col-span-1 flex justify-center">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
