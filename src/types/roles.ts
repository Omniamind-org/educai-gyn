export type UserRole = 'aluno' | 'professor' | 'coordenacao' | 'diretor' | null;

export interface RoleConfig {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
}

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    id: 'aluno',
    title: 'Sou Aluno',
    description: 'Acesse suas atividades, notas e gamificação',
    icon: 'GraduationCap',
    colorClass: 'student',
  },
  {
    id: 'professor',
    title: 'Sou Professor',
    description: 'Gerencie turmas, crie aulas e atividades',
    icon: 'Presentation',
    colorClass: 'teacher',
  },
  {
    id: 'coordenacao',
    title: 'Sou Coordenação',
    description: 'Acompanhe planos de aula e BNCC',
    icon: 'ClipboardCheck',
    colorClass: 'coordinator',
  },
  {
    id: 'diretor',
    title: 'Sou Diretor',
    description: 'Gestão financeira, metas e documentos',
    icon: 'Building',
    colorClass: 'director',
  },
];