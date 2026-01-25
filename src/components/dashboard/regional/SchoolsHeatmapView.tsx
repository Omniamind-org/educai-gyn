import { useState } from 'react';
import { SchoolUnit } from '@/data/regionalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SchoolsHeatmapViewProps {
  schools: SchoolUnit[];
  onSelectSchool: (school: SchoolUnit) => void;
}

export function SchoolsHeatmapView({ schools, onSelectSchool }: SchoolsHeatmapViewProps) {
  const [groupBy, setGroupBy] = useState<'region' | 'risk'>('region');

  // --- Logic for RISK Grouping (Old) ---
  const groupedByRisk = {
    stable: schools.filter(s => s.riskLevel === 'stable'),
    alert: schools.filter(s => s.riskLevel === 'alert'),
    critical: schools.filter(s => s.riskLevel === 'critical'),
  };

  const riskCategories = [
    { key: 'stable' as const, title: 'Estável', color: 'text-success', border: 'border-success', bg: 'bg-success/10' },
    { key: 'alert' as const, title: 'Alerta', color: 'text-warning', border: 'border-warning', bg: 'bg-warning/10' },
    { key: 'critical' as const, title: 'Crítico', color: 'text-destructive', border: 'border-destructive', bg: 'bg-destructive/10' },
  ];

  // --- Logic for REGION Grouping (New) ---
  const groupedByRegion = schools.reduce((acc, school) => {
    const region = school.region || 'Outros';
    if (!acc[region]) acc[region] = [];
    acc[region].push(school);
    return acc;
  }, {} as Record<string, SchoolUnit[]>);
  const regions = Object.keys(groupedByRegion).sort();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive hover:bg-destructive/20';
      case 'alert': return 'bg-warning/10 text-warning-foreground border-warning hover:bg-warning/20';
      default: return 'bg-success/10 text-success border-success hover:bg-success/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as any)} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="region">Por Região</TabsTrigger>
            <TabsTrigger value="risk">Por Status</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupBy === 'risk' ? (
          // RENDER BY RISK
          riskCategories.map((cat) => (
            <Card key={cat.key} className={cn('border-t-4', cat.border)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={cn('text-lg', cat.color)}>{cat.title}</CardTitle>
                  <span className={cn('text-2xl font-bold', cat.color)}>{groupedByRisk[cat.key].length}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedByRisk[cat.key].map(school => (
                    <div key={school.id} onClick={() => onSelectSchool(school)} className={cn('p-3 rounded-lg cursor-pointer transition-all', cat.bg, 'hover:opacity-80')}>
                       <div className="flex justify-between items-center">
                         <span className="font-medium text-sm">{school.name}</span>
                         <span className="text-xs opacity-70">{school.region}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // RENDER BY REGION
          regions.map((region) => (
            <Card key={region} className="border-t-4 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Região: {region}</CardTitle>
                  <span className="text-2xl font-bold">{groupedByRegion[region].length}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedByRegion[region].map((school) => (
                    <div key={school.id} className={cn('p-3 rounded-lg cursor-pointer transition-all border-l-4', getRiskColor(school.riskLevel))} onClick={() => onSelectSchool(school)}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{school.name}</span>
                        <span className="text-xs opacity-70 font-bold uppercase">{school.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
