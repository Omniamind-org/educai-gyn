import { useCoordinatorDashboard } from "@/hooks/dashboard/useCoordinatorDashboard";
import { CoordinatorStatsCards } from "./coordinator/CoordinatorStatsCards";
import { LessonPlansTable } from "./coordinator/LessonPlansTable";

export function CoordinatorDashboard() {
  const { lessonPlans, stats, loading, handleCompetenceClick } = useCoordinatorDashboard();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <CoordinatorStatsCards stats={stats} />

      {/* Radar BNCC Table */}
      <LessonPlansTable 
        plans={lessonPlans} 
        loading={loading} 
        onCompetenceClick={handleCompetenceClick} 
      />
    </div>
  );
}