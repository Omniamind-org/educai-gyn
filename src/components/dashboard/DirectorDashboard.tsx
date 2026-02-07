import { Loader2 } from 'lucide-react';
import { InfrastructureCensusSheet } from './director/InfrastructureCensusSheet';
import { useDirectorDashboard } from '@/hooks/dashboard/useDirectorDashboard';
import { DirectorStatsGrid } from './director/DirectorStatsGrid';
import { DirectorFinancialCards } from './director/DirectorFinancialCards';
import { DirectorCharts } from './director/DirectorCharts';
import { DirectorProjectsList } from './director/DirectorProjectsList';

export function DirectorDashboard() {
  const { 
    stats, 
    boletosByGrade, 
    isLoading, 
    schoolId, 
    isCensusOpen, 
    setIsCensusOpen,
    projects,
    fetchDashboardData,
    handleGenerateDocument
  } = useDirectorDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
        <DirectorStatsGrid stats={stats} />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
        <DirectorCharts boletosByGrade={boletosByGrade} stats={stats} />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <DirectorFinancialCards 
          stats={stats} 
          onGenerateDocument={handleGenerateDocument} 
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <DirectorProjectsList 
          projects={projects}
          onOpenCensus={() => setIsCensusOpen(true)}
        />
      </div>
      
      {schoolId && (
        <InfrastructureCensusSheet 
          open={isCensusOpen} 
          onOpenChange={(open) => {
            setIsCensusOpen(open);
            // Refresh data when closing
            if (!open) fetchDashboardData();
          }}
          schoolId={schoolId} 
        />
      )}
    </div>
  );
}