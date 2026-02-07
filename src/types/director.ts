export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalClasses: number;
  totalBoletos: number;
  boletosPendentes: number;
  boletosVencidos: number;
  boletosPagos: number;
  totalReceita: number;
  receitaPendente: number;
  infrastructure?: Record<string, any>;
  infrastructureScore?: number;
}

export interface BoletosByGrade {
  grade: string;
  pendentes: number;
  vencidos: number;
  valor: number;
}

export interface Project {
  id: number;
  title: string;
  status: 'em_andamento' | 'recebida' | 'planejado';
  budget: string;
  progress: number;
}
