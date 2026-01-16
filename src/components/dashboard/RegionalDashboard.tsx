import { useState, useEffect } from 'react'; // Added useEffect
import { calculateKPIs, SchoolUnit } from '@/data/regionalData'; // Removed schools
import { supabase } from '@/integrations/supabase/client'; // Added supabase import
import { KPICard } from './regional/KPICard';
import { SchoolsTableView } from './regional/SchoolsTableView';
import { SchoolsCardsView } from './regional/SchoolsCardsView';
import { SchoolsScatterView } from './regional/SchoolsScatterView';
import { SchoolsHeatmapView } from './regional/SchoolsHeatmapView';
import { SchoolDetailView } from './regional/SchoolDetailView';
import { IntelligentCopilot } from './regional/IntelligentCopilot';
import { DynamicDashboardArea } from './regional/DynamicDashboardArea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { List, LayoutGrid, TrendingUp, Grid3X3, Sparkles, Loader2 } from 'lucide-react'; // Added Loader2
import { DashboardConfig } from '@/types/dashboard';
import { useDashboardRegistry } from '@/hooks/useDashboardRegistry';
import { useToast } from '@/hooks/use-toast'; // Assuming hook exists

type ViewMode = 'table' | 'cards' | 'scatter' | 'heatmap';

export function RegionalDashboard() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolUnit | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [schools, setSchools] = useState<SchoolUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const { 
    activeDashboard, 
    createDashboard, 
    applyPatch, 
    clearDashboard,
    updateWidget 
  } = useDashboardRegistry();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select(`
            *,
            regions (name),
            school_metrics (subject, grade)
          `);

        if (error) throw error;

        if (data) {
          const mappedSchools: SchoolUnit[] = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            region: s.regions?.name || 'Desconhecida',
            totalStudents: s.total_students,
            permanence: s.permanence,
            averageGrade: s.average_grade,
            attendance: s.attendance,
            riskLevel: s.risk_level as any,
            teachers: s.teacher_count,
            teacherSatisfaction: s.teacher_satisfaction,
            continuedEducation: s.continued_education,
            infrastructure: s.infrastructure as any,
            academicPerformance: {
              math: s.school_metrics.find((m: any) => m.subject === 'math')?.grade || 0,
              languages: s.school_metrics.find((m: any) => m.subject === 'languages')?.grade || 0,
              sciences: s.school_metrics.find((m: any) => m.subject === 'sciences')?.grade || 0,
              humanities: s.school_metrics.find((m: any) => m.subject === 'humanities')?.grade || 0,
            },
            alerts: s.alerts || []
          }));
          setSchools(mappedSchools);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar as escolas do banco de dados.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const kpis = calculateKPIs(schools);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleDashboardGenerated = (dashboard: DashboardConfig) => {
    createDashboard(dashboard);
  };

  const handleDashboardUpdate = (patches: any[]) => {
    applyPatch(patches);
  };

  if (selectedSchool) {
    return (
      <div className={copilotOpen ? 'mr-80' : ''}>
        <SchoolDetailView school={selectedSchool} onBack={() => setSelectedSchool(null)} />
        <IntelligentCopilot 
          isOpen={copilotOpen} 
          onToggle={() => setCopilotOpen(!copilotOpen)}
          onDashboardGenerated={handleDashboardGenerated}
          onDashboardUpdate={handleDashboardUpdate}
        />
      </div>
    );
  }

  return (
    <div className={copilotOpen ? 'mr-80 transition-all' : 'transition-all'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-8 bg-primary rounded-full" />
            Aprendu Rede
          </h1>
          <p className="text-muted-foreground mt-1">Gestão Estratégica Regional</p>
        </div>
        <Button
          variant={copilotOpen ? 'default' : 'outline'}
          className="gap-2"
          onClick={() => setCopilotOpen(!copilotOpen)}
        >
          <Sparkles className="w-4 h-4" />
          EduGov Copilot
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total de Alunos" value={kpis.totalStudents.toLocaleString()} />
        <KPICard title="Engajamento Rede" value={`${kpis.avgPermanence}%`} trend={1.2} />
        <KPICard title="Unidades Críticas" value={`0${kpis.criticalUnits}`} variant="warning" />
        <KPICard title="Crescimento Ano" value={`+${kpis.avgGrade}%`} trend={2.5} />
      </div>

      {/* Dynamic Dashboard Area - AI Generated */}
      {activeDashboard && (
        <div className="mb-6">
          <DynamicDashboardArea
            dashboard={activeDashboard}
            onDismiss={clearDashboard}
            onWidgetViewModeChange={(widgetId, mode) => updateWidget(widgetId, { viewMode: mode })}
          />
        </div>
      )}

      {/* View Selector */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-5 bg-muted-foreground/30 rounded-full" />
              Comparativo entre Unidades
            </CardTitle>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
              <ToggleGroupItem value="table" aria-label="Tabela">
                <List className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="cards" aria-label="Cards">
                <LayoutGrid className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="scatter" aria-label="Dispersão">
                <TrendingUp className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="heatmap" aria-label="Heatmap">
                <Grid3X3 className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' && <SchoolsTableView schools={schools} onSelectSchool={setSelectedSchool} />}
          {viewMode === 'cards' && <SchoolsCardsView schools={schools} onSelectSchool={setSelectedSchool} />}
          {viewMode === 'scatter' && <SchoolsScatterView schools={schools} onSelectSchool={setSelectedSchool} />}
          {viewMode === 'heatmap' && <SchoolsHeatmapView schools={schools} onSelectSchool={setSelectedSchool} />}
        </CardContent>
      </Card>

      {/* Intelligent Copilot */}
      <IntelligentCopilot 
        isOpen={copilotOpen} 
        onToggle={() => setCopilotOpen(!copilotOpen)}
        onDashboardGenerated={handleDashboardGenerated}
        onDashboardUpdate={handleDashboardUpdate}
      />
    </div>
  );
}
