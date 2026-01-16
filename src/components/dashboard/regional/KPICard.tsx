import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  variant?: 'default' | 'warning' | 'success';
}

export function KPICard({ title, value, subtitle, trend, variant = 'default' }: KPICardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </p>
        <div className="flex items-center gap-3">
          <span className={cn('text-3xl font-bold', getVariantStyles())}>
            {value}
          </span>
          {trend !== undefined && (
            <span className={cn(
              'flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
              trend >= 0 ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
            )}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
