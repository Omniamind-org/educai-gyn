import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeacherService } from '@/services/teacher.service';

import { ClassWithDetails, Discipline } from '@/types/teacher';

export function useTeacherDashboard() {
  const { toast } = useToast();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [teacherDisciplines, setTeacherDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<{id: string, title: string} | null>(null);
  const [showSurveyAlert, setShowSurveyAlert] = useState(false);

  const fetchTeacherData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const teacherData = await TeacherService.getTeacherProfile(user.id);
      if (!teacherData) {
        setIsLoading(false);
        return;
      }

      setTeacherId(teacherData.id);

      // Load disciplines and classes in parallel
      const [disciplines, classesData] = await Promise.all([
        TeacherService.getTeacherDisciplines(teacherData.id),
        TeacherService.getTeacherClasses(teacherData.id)
      ]);

      setTeacherDisciplines(disciplines);
      setClasses(classesData);

      // Check survey
      const campaign = await TeacherService.checkActiveSurvey(teacherData.id);
      if (campaign) {
        setActiveCampaign(campaign);
        setShowSurveyAlert(true);
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  return {
    teacherId,
    classes,
    teacherDisciplines,
    isLoading,
    activeCampaign,
    showSurveyAlert,
    setShowSurveyAlert,
    refreshData: fetchTeacherData
  };
}
