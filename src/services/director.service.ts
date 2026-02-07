import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, BoletosByGrade } from '@/types/director';

export class DirectorService {
  static async getSchoolId(userId: string): Promise<string | null> {
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', userId).maybeSingle();
    
    if (profile?.school_id) {
      return profile.school_id;
    }
    
    // Fallback: get first school if no specific assignment (for demo/admin purposes)
    const { data: schoolData } = await supabase.from('schools').select('id').limit(1).maybeSingle();
    return schoolData?.id || null;
  }

  static async getDashboardStats(schoolId: string | null): Promise<DashboardStats> {
    // Parallel fetching for performance
    const [students, teachers, classes, boletos] = await Promise.all([
      supabase.from('students').select('id, status, grade'),
      supabase.from('teachers').select('id, status'),
      supabase.from('classes').select('id'),
      supabase.from('boletos').select('id, status, value, due_date, student_id, students(grade)')
    ]);

    const today = new Date();

    const processedBoletos = (boletos.data || []).map((b) => {
      let status = b.status;
      if (status === 'pendente' && new Date(b.due_date) < today) {
        status = 'vencido';
      }
      return { ...b, status };
    });

    const boletosPendentes = processedBoletos.filter(b => b.status === 'pendente').length;
    const boletosVencidos = processedBoletos.filter(b => b.status === 'vencido').length;
    const boletosPagos = processedBoletos.filter(b => b.status === 'pago').length;

    const totalReceita = processedBoletos
      .filter(b => b.status === 'pago')
      .reduce((sum, b) => sum + (b.value || 0), 0);

    const receitaPendente = processedBoletos
      .filter(b => b.status !== 'pago')
      .reduce((sum, b) => sum + (b.value || 0), 0);

    // Infrastructure data
    let infraData = {};
    let infraScore = 0;

    if (schoolId) {
      const { data: school } = await supabase.from('schools').select('infrastructure, risk_level').eq('id', schoolId).single();
      if (school) {
        infraData = school.infrastructure || {};
        
        const { data: survey } = await supabase.from('infrastructure_surveys')
          .select('score')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (survey) infraScore = survey.score || 0;
      }
    }

    return {
      totalStudents: students.data?.length || 0,
      activeStudents: students.data?.filter(s => s.status === 'ativo').length || 0,
      totalTeachers: teachers.data?.length || 0,
      activeTeachers: teachers.data?.filter(t => t.status === 'ativo').length || 0,
      totalClasses: classes.data?.length || 0,
      totalBoletos: processedBoletos.length,
      boletosPendentes,
      boletosVencidos,
      boletosPagos,
      totalReceita,
      receitaPendente,
      infrastructure: infraData,
      infrastructureScore: infraScore
    };
  }

  static async getBoletosByGrade(): Promise<BoletosByGrade[]> {
    const { data: boletos } = await supabase.from('boletos').select('id, status, value, due_date, student_id, students(grade)');
    
    if (!boletos) return [];
    
    const today = new Date();
    const gradeMap: Record<string, { pendentes: number; vencidos: number; valor: number }> = {};

    boletos.forEach((b) => {
        let status = b.status;
        if (status === 'pendente' && new Date(b.due_date) < today) {
            status = 'vencido';
        }

        const grade = b.students?.grade || 'Sem série';
        if (!gradeMap[grade]) {
            gradeMap[grade] = { pendentes: 0, vencidos: 0, valor: 0 };
        }
        
        if (status === 'pendente') {
            gradeMap[grade].pendentes += 1;
            gradeMap[grade].valor += b.value || 0;
        } else if (status === 'vencido') {
            gradeMap[grade].vencidos += 1;
            gradeMap[grade].valor += b.value || 0;
        }
    });

    return Object.entries(gradeMap).map(([grade, data]) => ({
        grade: grade.replace(' do Ensino Médio', ''),
        ...data,
    }));
  }
}
