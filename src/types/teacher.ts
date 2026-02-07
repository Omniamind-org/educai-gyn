export interface ClassWithDetails {
  id: string;
  name: string;
  grade: string;
  year: number;
  student_count: number;
}

export interface Discipline {
  id: string;
  name: string;
}

export interface GeneratedLessonPlan {
  id?: string;
  content: string;
  topic: string;
  series: string;
  bnccObjective: string;
}

export interface GeneratedExerciseList {
  id?: string;
  content: string;
  topic: string;
  series: string;
  bnccObjective: string;
}

export type TeacherView = 'dashboard' | 'progress-analysis' | 'class-detail' | 'lesson-plan-editor' | 'saved-plans' | 'exercise-list-editor' | 'saved-exercise-lists';

