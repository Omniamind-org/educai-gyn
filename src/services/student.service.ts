import { supabase } from '@/integrations/supabase/client';

export const StudentService = {
  // Placeholder for student related services
  async getStudentProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  }
};
