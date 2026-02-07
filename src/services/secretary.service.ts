import { supabase } from "@/integrations/supabase/client";
import { SecretaryStats } from "@/types/secretary";

export class SecretaryService {
  static async getDashboardStats(): Promise<SecretaryStats> {
    const [studentsRes, teachersRes, classesRes, boletosRes] = await Promise.all([
      supabase.from("students").select("status"),
      supabase.from("teachers").select("status"),
      supabase.from("classes").select("id", { count: "exact", head: true }),
      supabase.from("boletos").select("status, due_date")
    ]);

    const today = new Date();
    const boletos = boletosRes.data || [];
    
    // Calculate boleto stats
    const pending = boletos.filter(b => 
      b.status === "pendente" && new Date(b.due_date) >= today
    ).length;
    
    const overdue = boletos.filter(b => 
      b.status === "vencido" || (b.status === "pendente" && new Date(b.due_date) < today)
    ).length;

    return {
      students: {
        total: studentsRes.data?.length || 0,
        active: studentsRes.data?.filter(s => s.status === "ativo").length || 0
      },
      teachers: {
        total: teachersRes.data?.length || 0,
        active: teachersRes.data?.filter(t => t.status === "ativo").length || 0
      },
      classes: classesRes.count || 0,
      boletos: { pending, overdue }
    };
  }
}
