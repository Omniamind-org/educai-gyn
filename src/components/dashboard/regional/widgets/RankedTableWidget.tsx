import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WidgetConfig, WidgetViewMode } from '@/types/dashboard';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { List, BarChart3, LayoutGrid, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankedTableWidgetProps {
  config: WidgetConfig;
  onViewModeChange?: (mode: WidgetViewMode) => void;
}

export function RankedTableWidget({ config, onViewModeChange }: RankedTableWidgetProps) {
  const { title, subtitle, columns = [], data, viewMode = 'table', limit } = config;
  const rows = data.rows || [];
  const displayRows = limit ? rows.slice(0, limit) : rows;

  const getBadgeVariant = (value: string, column: typeof columns[0]) => {
    if (!column.badgeConfig) return 'secondary';
    const cfg = column.badgeConfig[value];
    if (!cfg) return 'secondary';
    
    switch (cfg.variant) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return 'outline';
    }
  };

  const getBadgeLabel = (value: string, column: typeof columns[0]) => {
    if (!column.badgeConfig) return value;
    return column.badgeConfig[value]?.label || value;
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const renderCellValue = (row: Record<string, unknown>, column: typeof columns[0]) => {
    const value = row[column.key];
    
    switch (column.type) {
      case 'badge':
        return (
          <Badge variant={getBadgeVariant(String(value), column)} className="text-xs">
            {getBadgeLabel(String(value), column)}
          </Badge>
        );
      
      case 'progress':
        const numValue = Number(value);
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn('h-full rounded-full transition-all', getProgressColor(numValue))}
                style={{ width: `${numValue}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">{numValue}%</span>
          </div>
        );
      
      case 'trend':
        const trendValue = Number(value);
        return (
          <div className="flex items-center gap-1">
            {getTrendIcon(trendValue)}
            <span className={cn(
              'text-xs',
              trendValue > 0 ? 'text-emerald-500' : trendValue < 0 ? 'text-red-500' : 'text-muted-foreground'
            )}>
              {trendValue > 0 ? '+' : ''}{trendValue}%
            </span>
          </div>
        );
      
      case 'number':
        return (
          <span className="font-medium">
            {typeof value === 'number' ? value.toFixed(1) : String(value)}
          </span>
        );
      
      default:
        return <span>{String(value)}</span>;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {onViewModeChange && (
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(v) => v && onViewModeChange(v as WidgetViewMode)}
              size="sm"
            >
              <ToggleGroupItem value="table" aria-label="Lista" className="h-7 w-7">
                <List className="w-3 h-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="chart" aria-label="Gráfico" className="h-7 w-7">
                <BarChart3 className="w-3 h-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="cards" aria-label="Cards" className="h-7 w-7">
                <LayoutGrid className="w-3 h-3" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {viewMode === 'table' && (
          <div className="space-y-0">
            {/* Header */}
            <div className="grid gap-4 py-2 border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wide" 
                 style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
              {columns.map(col => (
                <div key={col.key}>{String(col.label)}</div>
              ))}
            </div>
            {/* Rows */}
            {displayRows.map((row, idx) => (
              <div 
                key={idx}
                className="grid gap-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors text-sm"
                style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
              >
                {columns.map(col => (
                  <div key={col.key} className="flex items-center">
                    {renderCellValue(row, col)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="grid grid-cols-2 gap-3">
            {displayRows.map((row, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors"
              >
                <p className="font-medium text-sm mb-2">{String(row[columns[0]?.key] || '')}</p>
                <div className="space-y-1">
                  {columns.slice(1).map(col => (
                    <div key={col.key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{col.label}</span>
                      {renderCellValue(row, col)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'chart' && (
          <div className="space-y-2">
            {displayRows.map((row, idx) => {
              const numericCol = columns.find(c => c.type === 'number' || c.type === 'progress');
              const value = numericCol ? Number(row[numericCol.key]) : 0;
              const maxValue = Math.max(...displayRows.map(r => numericCol ? Number(r[numericCol.key]) : 0));
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs w-32 truncate">{String(row[columns[0]?.key] || '')}</span>
                  <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                    <div 
                      className={cn('h-full rounded transition-all', getProgressColor(value))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">{value.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
