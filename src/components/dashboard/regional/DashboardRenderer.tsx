import { WidgetConfig, WidgetViewMode } from '@/types/dashboard';
import {
  RankedTableWidget,
  KPIGridWidget,
  HeatmapRegionWidget,
  TimeSeriesWidget,
  StatusSLAWidget,
  DistributionWidget,
} from './widgets';

interface DashboardRendererProps {
  widgets: WidgetConfig[];
  onWidgetViewModeChange?: (widgetId: string, mode: WidgetViewMode) => void;
  onRegionClick?: (regionId: string) => void;
}

export function DashboardRenderer({ 
  widgets, 
  onWidgetViewModeChange,
  onRegionClick 
}: DashboardRendererProps) {
  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'RankedTable':
        return (
          <RankedTableWidget
            key={widget.id}
            config={widget}
            onViewModeChange={
              onWidgetViewModeChange 
                ? (mode) => onWidgetViewModeChange(widget.id, mode)
                : undefined
            }
          />
        );
      
      case 'KPIGrid':
        return <KPIGridWidget key={widget.id} config={widget} />;
      
      case 'HeatmapRegion':
        return (
          <HeatmapRegionWidget
            key={widget.id}
            config={widget}
            onRegionClick={onRegionClick}
          />
        );
      
      case 'TimeSeries':
        return <TimeSeriesWidget key={widget.id} config={widget} />;
      
      case 'StatusSLA':
        return <StatusSLAWidget key={widget.id} config={widget} />;
      
      case 'Distribution':
        return <DistributionWidget key={widget.id} config={widget} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {widgets.map(widget => (
        <div key={widget.id}>
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
}
