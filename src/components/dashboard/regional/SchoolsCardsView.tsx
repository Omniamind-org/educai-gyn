import { SchoolUnit } from '@/data/regionalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, GraduationCap, AlertCircle } from 'lucide-react';

interface SchoolsCardsViewProps {
  schools: SchoolUnit[];
  onSelectSchool: (school: SchoolUnit) => void;
}

export function SchoolsCardsView({ schools, onSelectSchool }: SchoolsCardsViewProps) {
  const getRiskBadge = (level: SchoolUnit['riskLevel']) => {
    switch (level) {
      case 'stable':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">REGULAR</Badge>;
      case 'alert':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0">ATENÇÃO</Badge>;
      case 'critical':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">CRÍTICO</Badge>;
    }
  };

  const getRiskBorderColor = (level: SchoolUnit['riskLevel']) => {
    switch (level) {
      case 'stable':
        return 'border-l-success';
      case 'alert':
        return 'border-l-warning';
      case 'critical':
        return 'border-l-destructive';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schools.map((school) => (
        <Card 
          key={school.id}
          className={`cursor-pointer hover:shadow-lg transition-all border-l-4 ${getRiskBorderColor(school.riskLevel)}`}
          onClick={() => onSelectSchool(school)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{school.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{school.region}</p>
              </div>
              {getRiskBadge(school.riskLevel)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alunos</p>
                  <p className="font-semibold">{school.totalStudents}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <GraduationCap className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Média</p>
                  <p className="font-semibold">{school.averageGrade}</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Permanência</span>
                <span className="font-medium">{school.permanence}%</span>
              </div>
              <Progress value={school.permanence} className="h-2" />
            </div>

            {school.alerts.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-warning">
                <AlertCircle className="w-3 h-3" />
                <span>{school.alerts.length} alerta(s)</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
