import { Card, CardContent } from '@/components/ui/card';
import { WidgetConfig } from '@/types/dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIGridWidgetProps {
  config: WidgetConfig;
}

interface KPIItem {
  label: string;
  value: string | number;
  trend?: number;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

export function KPIGridWidget({ config }: KPIGridWidgetProps) {
  const { data } = config;
  const items: KPIItem[] = data.rows as unknown as KPIItem[] || [];

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'danger':
        return 'border-red-500/30 bg-red-500/5';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5';
      default:
        return 'border-border/50';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <Card key={idx} className={cn('border', getVariantStyles(item.variant))}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <div className="flex items-end justify-between">
              <span className={cn(
                'text-2xl font-bold',
                item.variant === 'danger' ? 'text-red-500' : 
                item.variant === 'warning' ? 'text-amber-500' : 
                item.variant === 'success' ? 'text-emerald-500' : ''
              )}>
                {item.value}
              </span>
              {item.trend !== undefined && (
                <div className="flex items-center gap-0.5">
                  {getTrendIcon(item.trend)}
                  <span className={cn(
                    'text-xs',
                    item.trend > 0 ? 'text-emerald-500' : 
                    item.trend < 0 ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    {item.trend > 0 ? '+' : ''}{item.trend}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
