// Centralized student data for consistency across components

export interface Activity {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  type: 'essay' | 'exercise' | 'quiz';
  xp: number;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  xp: number;
}

export interface Lesson {
  id: number;
  title: string;
  duration?: string;
  type: 'video' | 'pdf';
}

export interface Discussion {
  id: number;
  author: string;
  avatar: string;
  message: string;
  time: string;
}

export interface SubjectData {
  tasks: Task[];
  lessons: Lesson[];
  discussions: Discussion[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

// All pending activities (used by AI context and activity list)
export const STUDENT_ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: 'Redação: O Papel da Tecnologia na Educação',
    subject: 'Português',
    dueDate: '25 Dez',
    type: 'essay',
    xp: 150,
  },
  {
    id: 2,
    title: 'Interpretação de Texto',
    subject: 'Português',
    dueDate: '28 Dez',
    type: 'exercise',
    xp: 80,
  },
  {
    id: 3,
    title: 'Funções do 2º Grau',
    subject: 'Matemática',
    dueDate: '27 Dez',
    type: 'exercise',
    xp: 100,
  },
  {
    id: 4,
    title: 'Exercícios de Logaritmos',
    subject: 'Matemática',
    dueDate: '30 Dez',
    type: 'exercise',
    xp: 90,
  },
  {
    id: 5,
    title: 'Quiz: Revolução Industrial',
    subject: 'História',
    dueDate: '28 Dez',
    type: 'quiz',
    xp: 80,
  },
  {
    id: 6,
    title: 'Ecossistemas Brasileiros',
    subject: 'Biologia',
    dueDate: '30 Dez',
    type: 'exercise',
    xp: 120,
  },
];

export const SUBJECTS: Subject[] = [
  { id: 'portugues', name: 'Português', color: 'bg-primary/10 text-primary', icon: 'FileText' },
  { id: 'matematica', name: 'Matemática', color: 'bg-success/10 text-success', icon: 'Calculator' },
  { id: 'historia', name: 'História', color: 'bg-warning/10 text-warning', icon: 'BookOpen' },
  { id: 'biologia', name: 'Biologia', color: 'bg-destructive/10 text-destructive', icon: 'BookOpen' },
];

export const SUBJECT_DATA: Record<string, SubjectData> = {
  portugues: {
    tasks: [
      { id: 1, title: 'Redação: O Papel da Tecnologia na Educação', dueDate: '25 Dez', xp: 150 },
      { id: 2, title: 'Interpretação de Texto', dueDate: '28 Dez', xp: 80 },
    ],
    lessons: [
      { id: 1, title: 'Coesão e Coerência', duration: '15 min', type: 'video' },
      { id: 2, title: 'Figuras de Linguagem', duration: '20 min', type: 'video' },
      { id: 3, title: 'Material: Redação ENEM', type: 'pdf' },
    ],
    discussions: [
      { id: 1, author: 'Maria Silva', avatar: 'maria', message: 'Alguém pode me ajudar com a estrutura da redação?', time: '2h atrás' },
      { id: 2, author: 'João Santos', avatar: 'joao', message: 'Como usar conectivos no desenvolvimento?', time: '5h atrás' },
    ],
  },
  matematica: {
    tasks: [
      { id: 1, title: 'Funções do 2º Grau', dueDate: '27 Dez', xp: 100 },
      { id: 2, title: 'Exercícios de Logaritmos', dueDate: '30 Dez', xp: 90 },
    ],
    lessons: [
      { id: 1, title: 'Introdução a Funções', duration: '25 min', type: 'video' },
      { id: 2, title: 'Gráficos de Parábolas', duration: '18 min', type: 'video' },
    ],
    discussions: [
      { id: 1, author: 'Pedro Lima', avatar: 'pedro', message: 'Como encontrar o vértice da parábola?', time: '1h atrás' },
    ],
  },
  historia: {
    tasks: [
      { id: 1, title: 'Quiz: Revolução Industrial', dueDate: '28 Dez', xp: 80 },
    ],
    lessons: [
      { id: 1, title: 'Era das Revoluções', duration: '30 min', type: 'video' },
      { id: 2, title: 'Linha do Tempo: Séc. XVIII', type: 'pdf' },
    ],
    discussions: [
      { id: 1, author: 'Ana Costa', avatar: 'ana', message: 'Qual a diferença entre as fases da Rev. Industrial?', time: '3h atrás' },
    ],
  },
  biologia: {
    tasks: [
      { id: 1, title: 'Ecossistemas Brasileiros', dueDate: '30 Dez', xp: 120 },
    ],
    lessons: [
      { id: 1, title: 'Biomas do Brasil', duration: '22 min', type: 'video' },
      { id: 2, title: 'Cadeias Alimentares', duration: '15 min', type: 'video' },
    ],
    discussions: [
      { id: 1, author: 'Lucas Oliveira', avatar: 'lucas', message: 'Dúvida sobre Mata Atlântica vs Amazônia', time: '4h atrás' },
    ],
  },
};

export const STUDENT_CONTEXT = {
  studentName: 'Aluno',
  level: 5,
  xp: 1250,
  streak: 12,
  activities: STUDENT_ACTIVITIES,
};
