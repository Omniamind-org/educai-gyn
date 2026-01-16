import { useState } from 'react';
import { mockSchools, calculateKPIs, SchoolUnit } from '@/data/regionalData';
import { KPICard } from './regional/KPICard';
import { SchoolsTableView } from './regional/SchoolsTableView';
import { SchoolsCardsView } from './regional/SchoolsCardsView';
import { SchoolsScatterView } from './regional/SchoolsScatterView';
import { SchoolsHeatmapView } from './regional/SchoolsHeatmapView';
import { SchoolDetailView } from './regional/SchoolDetailView';
import { EduGovCopilot } from './regional/EduGovCopilot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { List, LayoutGrid, TrendingUp, Grid3X3, Sparkles, Moon, Sun } from 'lucide-react';

type ViewMode = 'table' | 'cards' | 'scatter' | 'heatmap';

export function RegionalDashboard() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolUnit | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [copilotOpen, setCopilotOpen] = useState(false);

  const kpis = calculateKPIs(mockSchools);

  if (selectedSchool) {
    return (
      <div className={copilotOpen ? 'mr-96' : ''}>
        <SchoolDetailView school={selectedSchool} onBack={() => setSelectedSchool(null)} />
        <EduGovCopilot isOpen={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} />
      </div>
    );
  }

  return (
    <div className={copilotOpen ? 'mr-96 transition-all' : 'transition-all'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-8 bg-primary rounded-full" />
            Visão Geral da Rede
          </h1>
          <p className="text-muted-foreground mt-1">Gestão Estratégica Regional</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={copilotOpen ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => setCopilotOpen(!copilotOpen)}
          >
            <Sparkles className="w-4 h-4" />
            EduGov Copilot
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Alunos" value={kpis.totalStudents.toLocaleString()} />
        <KPICard title="Permanência Média" value={`${kpis.avgPermanence}%`} trend={-1.5} />
        <KPICard title="Unidades em Atenção" value={`0${kpis.criticalUnits}`} variant="warning" />
        <KPICard title="Média Global" value={kpis.avgGrade} />
      </div>

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
          {viewMode === 'table' && (
            <SchoolsTableView schools={mockSchools} onSelectSchool={setSelectedSchool} />
          )}
          {viewMode === 'cards' && (
            <SchoolsCardsView schools={mockSchools} onSelectSchool={setSelectedSchool} />
          )}
          {viewMode === 'scatter' && (
            <SchoolsScatterView schools={mockSchools} onSelectSchool={setSelectedSchool} />
          )}
          {viewMode === 'heatmap' && (
            <SchoolsHeatmapView schools={mockSchools} onSelectSchool={setSelectedSchool} />
          )}
        </CardContent>
      </Card>

      {/* Copilot Sidebar */}
      <EduGovCopilot isOpen={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} />
    </div>
  );
}
