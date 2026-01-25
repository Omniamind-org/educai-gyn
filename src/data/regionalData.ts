// Mock data for Regional Dashboard

export interface SchoolUnit {
  id: string;
  name: string;
  region: string;
  totalStudents: number;
  permanence: number;
  averageGrade: number;
  attendance: number;
  riskLevel: 'stable' | 'alert' | 'critical';
  teachers: number;
  teacherSatisfaction: number;
  continuedEducation: number;
  infrastructure: any;
  infrastructure_score?: number; // Added field because of new migration
  academicPerformance: {
    math: number;
    languages: number;
    sciences: number;
    humanities: number;
  };
  alerts: string[];
}

export const mockSchools: SchoolUnit[] = [
  {
    id: '1',
    name: 'Escola Estadual Centro',
    region: 'CENTRO',
    totalStudents: 450,
    permanence: 92,
    averageGrade: 8.5,
    attendance: 98,
    riskLevel: 'stable',
    teachers: 24,
    teacherSatisfaction: 45,
    continuedEducation: 85,
    infrastructure: {
      library: { books: 2500, status: 'active' },
      lab: { machines: 20, status: 'maintenance' },
    },
    infrastructure_score: 85,
    academicPerformance: {
      math: 8.5,
      languages: 9.0,
      sciences: 8.8,
      humanities: 9.2,
    },
    alerts: ['Baixa frequência registrada no 8º ano B (Semana 42).', 'Pendência na entrega do Censo Escolar.'],
  },
  {
    id: '2',
    name: 'Escola Prof. Norte A',
    region: 'NORTE',
    totalStudents: 320,
    permanence: 78,
    averageGrade: 7.2,
    attendance: 85,
    riskLevel: 'alert',
    teachers: 18,
    teacherSatisfaction: 32,
    continuedEducation: 60,
    infrastructure: {
      library: { books: 1800, status: 'active' },
      lab: { machines: 15, status: 'active' },
    },
    infrastructure_score: 72,
    academicPerformance: {
      math: 6.8,
      languages: 7.5,
      sciences: 7.0,
      humanities: 7.5,
    },
    alerts: ['Alta taxa de evasão no 9º ano.', 'Necessidade de reposição de professores.'],
  },
  {
    id: '3',
    name: 'CIEP Norte B (Integral)',
    region: 'NORTE',
    totalStudents: 290,
    permanence: 65,
    averageGrade: 6.5,
    attendance: 78,
    riskLevel: 'critical',
    teachers: 22,
    teacherSatisfaction: 28,
    continuedEducation: 45,
    infrastructure: {
      library: { books: 1200, status: 'maintenance' },
      lab: { machines: 10, status: 'maintenance' },
    },
    infrastructure_score: 45,
    academicPerformance: {
      math: 5.8,
      languages: 6.5,
      sciences: 6.2,
      humanities: 7.0,
    },
    alerts: ['Risco crítico de evasão.', 'Infraestrutura precisa de reformas urgentes.', 'Déficit de professores de matemática.'],
  },
  {
    id: '4',
    name: 'Colégio Sul Modelo',
    region: 'SUL',
    totalStudents: 510,
    permanence: 95,
    averageGrade: 8.8,
    attendance: 96,
    riskLevel: 'stable',
    teachers: 30,
    teacherSatisfaction: 68,
    continuedEducation: 92,
    infrastructure: {
      library: { books: 4000, status: 'active' },
      lab: { machines: 35, status: 'active' },
    },
    infrastructure_score: 95,
    academicPerformance: {
      math: 8.9,
      languages: 9.2,
      sciences: 8.5,
      humanities: 8.8,
    },
    alerts: [],
  },
  {
    id: '5',
    name: 'Escola Técnica Leste',
    region: 'LESTE',
    totalStudents: 280,
    permanence: 62,
    averageGrade: 7.0,
    attendance: 80,
    riskLevel: 'critical',
    teachers: 16,
    teacherSatisfaction: 25,
    continuedEducation: 50,
    infrastructure: {
      library: { books: 1500, status: 'active' },
      lab: { machines: 25, status: 'maintenance' },
    },
    academicPerformance: {
      math: 7.2,
      languages: 6.8,
      sciences: 7.5,
      humanities: 6.5,
    },
    alerts: ['Alta evasão no curso técnico.', 'Equipamentos do laboratório desatualizados.'],
  },
  {
    id: '6',
    name: 'C.E. Oeste Integrado',
    region: 'OESTE',
    totalStudents: 410,
    permanence: 88,
    averageGrade: 7.8,
    attendance: 92,
    riskLevel: 'stable',
    teachers: 26,
    teacherSatisfaction: 52,
    continuedEducation: 78,
    infrastructure: {
      library: { books: 2800, status: 'active' },
      lab: { machines: 22, status: 'active' },
    },
    academicPerformance: {
      math: 7.5,
      languages: 8.0,
      sciences: 7.8,
      humanities: 8.0,
    },
    alerts: ['Monitorar turmas do período noturno.'],
  },
  {
    id: '7',
    name: 'Escola Centro Sul',
    region: 'CENTRO',
    totalStudents: 380,
    permanence: 89,
    averageGrade: 7.5,
    attendance: 94,
    riskLevel: 'stable',
    teachers: 20,
    teacherSatisfaction: 48,
    continuedEducation: 72,
    infrastructure: {
      library: { books: 2200, status: 'active' },
      lab: { machines: 18, status: 'active' },
    },
    academicPerformance: {
      math: 7.2,
      languages: 7.8,
      sciences: 7.5,
      humanities: 7.5,
    },
    alerts: [],
  },
];

export function calculateKPIs(schools: SchoolUnit[]) {
  const totalStudents = schools.reduce((sum, s) => sum + s.totalStudents, 0);
  const avgPermanence = schools.reduce((sum, s) => sum + s.permanence, 0) / schools.length;
  const avgGrade = schools.reduce((sum, s) => sum + s.averageGrade, 0) / schools.length;
  const criticalUnits = schools.filter(s => s.riskLevel === 'critical' || s.riskLevel === 'alert').length;

  return {
    totalStudents,
    avgPermanence: Math.round(avgPermanence * 10) / 10,
    avgGrade: Math.round(avgGrade * 10) / 10,
    criticalUnits,
  };
}
