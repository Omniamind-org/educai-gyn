declare global {
  interface Window {
    sendUserMessage?: (prompt: string, input: string) => void;
    addAIMessage?: (message: string) => void;
  }
}

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DirectorService } from '@/services/director.service';
import { DashboardStats, BoletosByGrade, Project } from '@/types/director';
import { PROJECTS } from '@/constants/director';

export function useDirectorDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [boletosByGrade, setBoletosByGrade] = useState<BoletosByGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [isCensusOpen, setIsCensusOpen] = useState(false);
  const [projects, setProjects] = useState<readonly Project[]>(PROJECTS);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const id = await DirectorService.getSchoolId(user.id);
        setSchoolId(id);
        
        // Fetch stats using the service
        const dashboardStats = await DirectorService.getDashboardStats(id);
        setStats(dashboardStats);
        
        const boletosData = await DirectorService.getBoletosByGrade();
        setBoletosByGrade(boletosData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleGenerateDocument = async (prompt: string, documentInput: string) => {
    if (window.sendUserMessage) {
        window.sendUserMessage(prompt, documentInput);
    } else if (window.addAIMessage) {
        window.addAIMessage("Erro: Sistema de chat não inicializado. Tente recarregar a página.");
    }
  }

  return {
    stats,
    boletosByGrade,
    isLoading,
    schoolId,
    isCensusOpen,
    setIsCensusOpen,
    projects,
    fetchDashboardData,
    handleGenerateDocument
  };
}
