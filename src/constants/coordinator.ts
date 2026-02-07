import { LessonPlan } from "@/types/coordinator";

export const LESSON_PLANS: LessonPlan[] = [
  {
    id: 1,
    teacher: 'Maria Silva',
    subject: 'Português',
    topic: 'Literatura Brasileira: Modernismo',
    grade: '3º Ano',
    status: 'approved',
    bnccScore: 95,
    missingCompetence: null,
  },
  {
    id: 2,
    teacher: 'João Santos',
    subject: 'Matemática',
    topic: 'Geometria Espacial',
    grade: '2º Ano',
    status: 'approved',
    bnccScore: 88,
    missingCompetence: null,
  },
  {
    id: 3,
    teacher: 'Ana Oliveira',
    subject: 'História',
    topic: 'Idade Média',
    grade: '1º Ano',
    status: 'pending',
    bnccScore: 62,
    missingCompetence: 'EF09HI05',
  },
  {
    id: 4,
    teacher: 'Carlos Lima',
    subject: 'Ciências',
    topic: 'Ecossistemas',
    grade: '2º Ano',
    status: 'approved',
    bnccScore: 91,
    missingCompetence: null,
  },
  {
    id: 5,
    teacher: 'Paula Costa',
    subject: 'Geografia',
    topic: 'Urbanização no Brasil',
    grade: '3º Ano',
    status: 'pending',
    bnccScore: 55,
    missingCompetence: 'EF09GE02',
  },
];

export const COMPETENCE_EXPLANATIONS: Record<string, string> = {
  'EF09HI05': '📋 Este plano de aula não aborda adequadamente a competência EF09HI05 que trata da "diversidade cultural e identidade nacional". Sugiro incluir:\n\n• Discussão sobre influências culturais na Idade Média\n• Atividade comparativa entre culturas medievais\n• Reflexão sobre legados culturais',
  'EF09GE02': '📋 O plano não contempla a competência EF09GE02 sobre "análise de processos migratórios". Recomendo adicionar:\n\n• Dados sobre migração campo-cidade\n• Impactos sociais da urbanização\n• Estudo de caso de cidades brasileiras',
};
