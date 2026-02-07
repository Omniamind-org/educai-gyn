import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CoordinatorService } from "@/services/coordinator.service";
import { LessonPlan, CoordinatorStats } from "@/types/coordinator";
import { COMPETENCE_EXPLANATIONS } from "@/constants/coordinator";

// Extend Window interface for AI integration
declare global {
  interface Window {
    addAIMessage?: (message: string) => void;
  }
}

export function useCoordinatorDashboard() {
  const { toast } = useToast();
  
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [stats, setStats] = useState<CoordinatorStats>({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const plans = await CoordinatorService.getLessonPlans();
        const computedStats = CoordinatorService.calculateStats(plans);
        
        setLessonPlans(plans);
        setStats(computedStats);
      } catch (error) {
        console.error("Error fetching coordinator data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os planos de aula."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleCompetenceClick = (competence: string | null) => {
    if (competence && window.addAIMessage) {
      const explanation = COMPETENCE_EXPLANATIONS[competence] || 'Competência não encontrada.';
      window.addAIMessage(explanation);
    }
  };

  return {
    lessonPlans,
    stats,
    loading,
    handleCompetenceClick
  };
}
