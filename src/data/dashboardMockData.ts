import { SchoolMetrics, RegionMetrics } from '@/types/dashboard';

// Dados detalhados das escolas para o dashboard inteligente
export const schoolsMetrics: SchoolMetrics[] = [
  {
    id: '1',
    name: 'Escola Estadual Centro',
    region: 'Centro',
    regionId: 'centro',
    totalStudents: 450,
    permanence: 92,
    averageGrade: 7.8,
    mathGrade: 7.5,
    portugueseGrade: 8.0,
    scienceGrade: 7.9,
    riskLevel: 'stable',
    engagement: 94,
    submissionStatus: 'on_time',
    trend: 2.5,
  },
  {
    id: '2',
    name: 'Escola Prof. Norte A',
    region: 'Norte',
    regionId: 'norte',
    totalStudents: 320,
    permanence: 78,
    averageGrade: 6.2,
    mathGrade: 5.8,
    portugueseGrade: 6.5,
    scienceGrade: 6.3,
    riskLevel: 'alert',
    engagement: 72,
    submissionStatus: 'delayed',
    trend: -1.2,
  },
  {
    id: '3',
    name: 'CIEP Norte B (Integral)',
    region: 'Norte',
    regionId: 'norte',
    totalStudents: 290,
    permanence: 65,
    averageGrade: 4.5,
    mathGrade: 4.2,
    portugueseGrade: 4.8,
    scienceGrade: 4.5,
    riskLevel: 'critical',
    engagement: 58,
    submissionStatus: 'delayed',
    trend: -3.5,
  },
  {
    id: '4',
    name: 'Colégio Sul Modelo',
    region: 'Sul',
    regionId: 'sul',
    totalStudents: 510,
    permanence: 95,
    averageGrade: 8.2,
    mathGrade: 8.0,
    portugueseGrade: 8.5,
    scienceGrade: 8.1,
    riskLevel: 'stable',
    engagement: 96,
    submissionStatus: 'on_time',
    trend: 3.2,
  },
  {
    id: '5',
    name: 'Escola Técnica Leste',
    region: 'Leste',
    regionId: 'leste',
    totalStudents: 280,
    permanence: 62,
    averageGrade: 5.5,
    mathGrade: 5.2,
    portugueseGrade: 5.8,
    scienceGrade: 5.5,
    riskLevel: 'critical',
    engagement: 55,
    submissionStatus: 'pending',
    trend: -2.8,
  },
  {
    id: '6',
    name: 'C.E. Oeste Integrado',
    region: 'Oeste',
    regionId: 'oeste',
    totalStudents: 410,
    permanence: 88,
    averageGrade: 7.2,
    mathGrade: 7.0,
    portugueseGrade: 7.4,
    scienceGrade: 7.2,
    riskLevel: 'stable',
    engagement: 86,
    submissionStatus: 'on_time',
    trend: 1.5,
  },
  {
    id: '7',
    name: 'Escola Centro Sul',
    region: 'Centro',
    regionId: 'centro',
    totalStudents: 380,
    permanence: 89,
    averageGrade: 7.5,
    mathGrade: 7.3,
    portugueseGrade: 7.8,
    scienceGrade: 7.4,
    riskLevel: 'stable',
    engagement: 88,
    submissionStatus: 'on_time',
    trend: 1.8,
  },
  {
    id: '8',
    name: 'Escola Periférica Norte C',
    region: 'Norte',
    regionId: 'norte',
    totalStudents: 260,
    permanence: 58,
    averageGrade: 3.8,
    mathGrade: 3.5,
    portugueseGrade: 4.0,
    scienceGrade: 3.9,
    riskLevel: 'critical',
    engagement: 48,
    submissionStatus: 'delayed',
    trend: -4.2,
  },
  {
    id: '9',
    name: 'Escola Rural Oeste',
    region: 'Oeste',
    regionId: 'oeste',
    totalStudents: 180,
    permanence: 75,
    averageGrade: 6.0,
    mathGrade: 5.8,
    portugueseGrade: 6.2,
    scienceGrade: 6.0,
    riskLevel: 'alert',
    engagement: 70,
    submissionStatus: 'on_time',
    trend: 0.5,
  },
  {
    id: '10',
    name: 'CAIC Sul Integrado',
    region: 'Sul',
    regionId: 'sul',
    totalStudents: 420,
    permanence: 91,
    averageGrade: 7.9,
    mathGrade: 7.7,
    portugueseGrade: 8.1,
    scienceGrade: 7.9,
    riskLevel: 'stable',
    engagement: 92,
    submissionStatus: 'on_time',
    trend: 2.1,
  },
];

// Métricas agregadas por região
export const regionsMetrics: RegionMetrics[] = [
  {
    id: 'centro',
    name: 'Centro',
    schoolCount: 2,
    totalStudents: 830,
    avgPermanence: 90.5,
    avgGrade: 7.65,
    criticalCount: 0,
  },
  {
    id: 'norte',
    name: 'Norte',
    schoolCount: 3,
    totalStudents: 870,
    avgPermanence: 67,
    avgGrade: 4.83,
    criticalCount: 2,
  },
  {
    id: 'sul',
    name: 'Sul',
    schoolCount: 2,
    totalStudents: 930,
    avgPermanence: 93,
    avgGrade: 8.05,
    criticalCount: 0,
  },
  {
    id: 'leste',
    name: 'Leste',
    schoolCount: 1,
    totalStudents: 280,
    avgPermanence: 62,
    avgGrade: 5.5,
    criticalCount: 1,
  },
  {
    id: 'oeste',
    name: 'Oeste',
    schoolCount: 2,
    totalStudents: 590,
    avgPermanence: 81.5,
    avgGrade: 6.6,
    criticalCount: 0,
  },
];

// Calcular KPIs gerais
export const calculateGlobalKPIs = () => {
  const totalStudents = schoolsMetrics.reduce((sum, s) => sum + s.totalStudents, 0);
  const avgEngagement = Math.round(
    schoolsMetrics.reduce((sum, s) => sum + s.engagement, 0) / schoolsMetrics.length
  );
  const criticalUnits = schoolsMetrics.filter(s => s.riskLevel === 'critical').length;
  const avgGrowth = (
    schoolsMetrics.reduce((sum, s) => sum + s.trend, 0) / schoolsMetrics.length
  ).toFixed(1);

  return {
    totalStudents,
    avgEngagement,
    criticalUnits,
    avgGrowth: parseFloat(avgGrowth),
  };
};

// Helpers para queries específicas
export const getSchoolsByRegion = (regionId: string) => 
  schoolsMetrics.filter(s => s.regionId === regionId);

export const getSchoolsByRisk = (risk: 'stable' | 'alert' | 'critical') =>
  schoolsMetrics.filter(s => s.riskLevel === risk);

export const getTopSchoolsByMetric = (metric: keyof SchoolMetrics, limit = 5, order: 'asc' | 'desc' = 'desc') => {
  const sorted = [...schoolsMetrics].sort((a, b) => {
    const aVal = a[metric] as number;
    const bVal = b[metric] as number;
    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });
  return sorted.slice(0, limit);
};

export const getBottomSchoolsByMetric = (metric: keyof SchoolMetrics, limit = 5) => 
  getTopSchoolsByMetric(metric, limit, 'asc');
