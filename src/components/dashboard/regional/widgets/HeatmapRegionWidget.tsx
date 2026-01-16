import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetConfig } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface HeatmapRegionWidgetProps {
  config: WidgetConfig;
  onRegionClick?: (regionId: string) => void;
}

interface RegionData {
  id: string;
  name: string;
  value: number;
  risk: 'stable' | 'alert' | 'critical';
  schools?: number;
  students?: number;
}

export function HeatmapRegionWidget({ config, onRegionClick }: HeatmapRegionWidgetProps) {
  const { title, subtitle, data } = config;
  const regions: RegionData[] = (data.regions as unknown as RegionData[]) || [];

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30';
      case 'alert':
        return 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30';
      case 'stable':
        return 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30';
      default:
        return 'bg-muted border-border';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'critical': return 'Crítico';
      case 'alert': return 'Atenção';
      case 'stable': return 'Estável';
      default: return risk;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {regions.map((region) => (
            <div
              key={region.id}
              onClick={() => onRegionClick?.(region.id)}
              className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                getRiskStyles(region.risk)
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{region.name}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  region.risk === 'critical' ? 'bg-red-500/30 text-red-400' :
                  region.risk === 'alert' ? 'bg-amber-500/30 text-amber-400' :
                  'bg-emerald-500/30 text-emerald-400'
                )}>
                  {getRiskLabel(region.risk)}
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {region.schools !== undefined && (
                  <div className="flex justify-between">
                    <span>Escolas</span>
                    <span className="font-medium text-foreground">{region.schools}</span>
                  </div>
                )}
                {region.students !== undefined && (
                  <div className="flex justify-between">
                    <span>Alunos</span>
                    <span className="font-medium text-foreground">{region.students.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Métrica</span>
                  <span className="font-medium text-foreground">{region.value}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Estável</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Atenção</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Crítico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
