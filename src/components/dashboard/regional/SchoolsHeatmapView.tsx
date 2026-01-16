import { SchoolUnit } from '@/data/regionalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SchoolsHeatmapViewProps {
  schools: SchoolUnit[];
  onSelectSchool: (school: SchoolUnit) => void;
}

export function SchoolsHeatmapView({ schools, onSelectSchool }: SchoolsHeatmapViewProps) {
  const groupedByRisk = {
    stable: schools.filter(s => s.riskLevel === 'stable'),
    alert: schools.filter(s => s.riskLevel === 'alert'),
    critical: schools.filter(s => s.riskLevel === 'critical'),
  };

  const categories = [
    {
      key: 'stable' as const,
      title: 'Estável',
      description: 'Unidades com indicadores dentro da meta',
      bgColor: 'bg-success/10',
      borderColor: 'border-success',
      textColor: 'text-success',
      hoverBg: 'hover:bg-success/20',
    },
    {
      key: 'alert' as const,
      title: 'Alerta',
      description: 'Requer monitoramento intensivo',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      hoverBg: 'hover:bg-warning/20',
    },
    {
      key: 'critical' as const,
      title: 'Crítico',
      description: 'Intervenção imediata necessária',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive',
      textColor: 'text-destructive',
      hoverBg: 'hover:bg-destructive/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card key={category.key} className={cn('border-t-4', category.borderColor)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={cn('text-lg', category.textColor)}>
                {category.title}
              </CardTitle>
              <span className={cn(
                'text-2xl font-bold',
                category.textColor
              )}>
                {groupedByRisk[category.key].length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groupedByRisk[category.key].length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma unidade
                </p>
              ) : (
                groupedByRisk[category.key].map((school) => (
                  <div
                    key={school.id}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-all',
                      category.bgColor,
                      category.hoverBg
                    )}
                    onClick={() => onSelectSchool(school)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.region}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{school.permanence}%</p>
                        <p className="text-xs text-muted-foreground">Permanência</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
