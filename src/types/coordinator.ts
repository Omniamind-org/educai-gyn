export interface LessonPlan {
  id: number;
  teacher: string;
  subject: string;
  topic: string;
  grade: string;
  status: 'approved' | 'pending';
  bnccScore: number;
  missingCompetence: string | null;
}

export interface CoordinatorStats {
  total: number;
  approved: number;
  pending: number;
}
