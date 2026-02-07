import { supabase } from '@/integrations/supabase/client';

export const TeacherService = {
  async getTeacherProfile(userId: string) {
    const { data: teacherData, error } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    return teacherData;
  },

  async getTeacherDisciplines(teacherId: string) {
    const { data: teacherDiscData, error } = await supabase
      .from('teacher_disciplines')
      .select('discipline_id')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    if (!teacherDiscData || teacherDiscData.length === 0) return [];

    const discIds = teacherDiscData.map(td => td.discipline_id);
    const { data: disciplinesData, error: discError } = await supabase
      .from('disciplines')
      .select('id, name')
      .in('id', discIds);
      
    if (discError) throw discError;
    return disciplinesData || [];
  },

  async getTeacherClasses(teacherId: string) {
    // Get classes assigned to this teacher
    const { data: classTeacherData, error } = await supabase
      .from('class_teachers')
      .select('class_id')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    if (!classTeacherData || classTeacherData.length === 0) return [];

    const classIds = classTeacherData.map(ct => ct.class_id);

    // Get class details
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .in('id', classIds);

    if (classesError) throw classesError;
    if (!classesData) return [];

    // Get student counts for each class
    const classesWithCounts = await Promise.all(
      classesData.map(async (cls) => {
        const { count } = await supabase
          .from('class_students')
          .select('id', { count: 'exact' })
          .eq('class_id', cls.id);
        
        return {
          ...cls,
          student_count: count || 0,
        };
      })
    );

    return classesWithCounts;
  },

  async checkActiveSurvey(teacherId: string) {
    const today = new Date().toISOString().split('T')[0];
      
    // 1. Find active campaign
    const { data: campaigns, error } = await supabase
      .from('survey_campaigns')
      .select('*')
      .eq('target_role', 'professor')
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .limit(1);

    if (error) throw error;
    if (!campaigns || campaigns.length === 0) return null;

    const campaign = campaigns[0];

    // 2. Check if already answered
    const { count, error: countError } = await supabase
      .from('climate_surveys')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaign.id)
      .eq('teacher_id', teacherId);

    if (countError) throw countError;

    if (count === 0) {
      return { id: campaign.id, title: campaign.title };
    }
    
    return null;
  }
};
