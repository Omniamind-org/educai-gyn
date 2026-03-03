import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { CoordinatorService } from "@/services/coordinator.service";
import { LessonPlan, CoordinatorStats } from "@/types/coordinator";
import { COMPETENCE_EXPLANATIONS } from "@/constants/coordinator";

// Extend Window interface for AI integration
declare global {
  interface Window {
    addAIMessage?: (message: string) => void;
    __coordinatorPlans?: import("@/types/coordinator").LessonPlan[];
  }
}

// Custom event dispatched by AISidebar when the AI emits an <intent> tag
export interface AIIntentDetail {
  type: string;
  action: string;
  planIds: number[];
}

export function useCoordinatorDashboard() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [stats, setStats] = useState<CoordinatorStats>({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        console.log("COORD: Initial fetch started");
        setLoading(true);
        const plans = await CoordinatorService.getLessonPlans();
        if (isMounted) {
          console.log("COORD: Data fetched, length:", plans.length);
          setLessonPlans(plans);
        }
      } catch (error) {
        console.error("COORD: Fetch error:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os planos de aula."
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Recalculate stats whenever lessonPlans change
  useEffect(() => {
    if (lessonPlans.length > 0) {
      console.log("COORD: Updating stats for plans:", lessonPlans.length);
      const computedStats = CoordinatorService.calculateStats(lessonPlans);
      setStats(computedStats);
    }
  }, [lessonPlans]);

  // Expose current lesson plans to AISidebar so it can send context to the AI
  useEffect(() => {
    (window as Window).__coordinatorPlans = lessonPlans;
    return () => { delete (window as Window).__coordinatorPlans; };
  }, [lessonPlans]);

  const handleCompetenceClick = useCallback((competence: string | null) => {
    if (competence && window.addAIMessage) {
      const explanation = COMPETENCE_EXPLANATIONS[competence] || 'Competência não encontrada.';
      window.addAIMessage(explanation);
    }
  }, []);

  const handleStatusUpdate = useCallback(async (planId: number, status: 'approved' | 'pending') => {
    console.log("COORD: handleStatusUpdate called", { planId, status });
    try {
      const success = await CoordinatorService.updateStatus(planId, status);
      if (success) {
        console.log("COORD: Update successful, patching local state");
        setLessonPlans(prevPlans => prevPlans.map(p =>
          p.id === planId ? { ...p, status, missingCompetence: status === 'approved' ? null : p.missingCompetence } : p
        ));

        toast({
          title: "Status atualizado",
          description: `O plano foi marcado como ${status === 'approved' ? 'aderente' : 'pendente'}.`
        });
      } else {
        console.warn("COORD: Update returned false");
      }
    } catch (error) {
      console.error("COORD: Status update error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status do plano."
      });
    }
  }, []);

  const handleBulkStatusUpdate = useCallback(async (planIds: number[], status: 'approved' | 'pending') => {
    console.log("COORD: handleBulkStatusUpdate called", { planIds, status });
    try {
      const success = await CoordinatorService.bulkUpdateStatus(planIds, status);
      if (success) {
        console.log("COORD: Bulk update successful, patching local state");
        setLessonPlans(prevPlans => prevPlans.map(p =>
          planIds.includes(p.id) ? { ...p, status, missingCompetence: status === 'approved' ? null : p.missingCompetence } : p
        ));

        toast({
          title: "Status atualizado em lote",
          description: `${planIds.length} planos foram marcados como ${status === 'approved' ? 'aderentes' : 'pendentes'}.`
        });
      } else {
        console.warn("COORD: Bulk update returned false");
      }
    } catch (error) {
      console.error("COORD: Bulk status update error:", error);
      toast({
        variant: "destructive",
        title: "Erro na atualização em lote",
        description: "Não foi possível alterar o status dos planos selecionados."
      });
    }
  }, []);

  // Listen for AI Intent events dispatched by AISidebar
  useEffect(() => {
    const handleAIIntent = (e: Event) => {
      const { type, action, planIds } = (e as CustomEvent<AIIntentDetail>).detail;
      if (type !== 'update_bncc') return;
      const validStatus = action === 'approve' ? 'approved' : action === 'pending' ? 'pending' : null;
      if (!validStatus || !Array.isArray(planIds) || planIds.length === 0) return;
      console.log('COORD: AI Intent received', { type, action, planIds });
      if (planIds.length === 1) {
        handleStatusUpdate(planIds[0], validStatus);
      } else {
        handleBulkStatusUpdate(planIds, validStatus);
      }
    };
    window.addEventListener('ai_intent', handleAIIntent);
    return () => window.removeEventListener('ai_intent', handleAIIntent);
  }, [handleStatusUpdate, handleBulkStatusUpdate]);

  return {
    lessonPlans,
    stats,
    loading,
    handleCompetenceClick,
    handleStatusUpdate,
    handleBulkStatusUpdate
  };
}
