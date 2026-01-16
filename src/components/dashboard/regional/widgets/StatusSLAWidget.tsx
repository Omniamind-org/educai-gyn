import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WidgetConfig } from '@/types/dashboard';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSLAWidgetProps {
  config: WidgetConfig;
}

interface SLAItem {
  name: string;
  status: 'on_time' | 'delayed' | 'pending' | 'overdue';
  dueDate?: string;
  submittedAt?: string;
  daysRemaining?: number;
}

export function StatusSLAWidget({ config }: StatusSLAWidgetProps) {
  const { title, subtitle, data } = config;
  const items: SLAItem[] = data.rows as unknown as SLAItem[] || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_time':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'delayed':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_time': return 'No prazo';
      case 'delayed': return 'Atrasado';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_time':
        return <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">No prazo</Badge>;
      case 'delayed':
        return <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">Atrasado</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Vencido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Summary counts
  const summary = {
    onTime: items.filter(i => i.status === 'on_time').length,
    delayed: items.filter(i => i.status === 'delayed').length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.status === 'overdue').length,
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
        {/* Summary */}
        <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-500">{summary.onTime}</p>
            <p className="text-[10px] text-muted-foreground">No prazo</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-500">{summary.pending}</p>
            <p className="text-[10px] text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-500">{summary.delayed}</p>
            <p className="text-[10px] text-muted-foreground">Atrasados</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">{summary.overdue}</p>
            <p className="text-[10px] text-muted-foreground">Vencidos</p>
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div 
              key={idx}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg transition-colors',
                item.status === 'overdue' ? 'bg-red-500/5' :
                item.status === 'delayed' ? 'bg-amber-500/5' :
                'bg-muted/20'
              )}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Prazo: {item.dueDate}
                  </span>
                )}
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
