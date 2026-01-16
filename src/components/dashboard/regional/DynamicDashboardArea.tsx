import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardConfig } from '@/types/dashboard';
import { DashboardRenderer } from './DashboardRenderer';
import { Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DynamicDashboardAreaProps {
  dashboard: DashboardConfig | null;
  onDismiss: () => void;
  onWidgetViewModeChange?: (widgetId: string, mode: any) => void;
}

export function DynamicDashboardArea({ 
  dashboard, 
  onDismiss,
  onWidgetViewModeChange 
}: DynamicDashboardAreaProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!dashboard) return null;

  return (
    <Card className={cn(
      'border-primary/30 bg-gradient-to-br from-card to-primary/5 transition-all',
      isMinimized && 'h-auto'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {dashboard.title}
              </CardTitle>
              {dashboard.subtitle && (
                <p className="text-xs text-muted-foreground">{dashboard.subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onDismiss}
            >
              Descartar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="pt-0">
          <DashboardRenderer 
            widgets={dashboard.widgets}
            onWidgetViewModeChange={onWidgetViewModeChange}
          />
        </CardContent>
      )}
    </Card>
  );
}
