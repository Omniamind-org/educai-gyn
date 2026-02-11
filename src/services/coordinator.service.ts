import { LessonPlan, CoordinatorStats } from "@/types/coordinator";
import { LESSON_PLANS } from "@/constants/coordinator";

export class CoordinatorService {
  /**
   * Fetches lesson plans. Currently returns mocked data.
   * In the future, this will fetch from Supabase.
   */
  static async getLessonPlans(): Promise<LessonPlan[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return LESSON_PLANS;
  }

  /**
   * Calculates stats based on lesson plans.
   */
  static calculateStats(plans: LessonPlan[]): CoordinatorStats {
    const total = plans.length;
    const approved = plans.filter(p => p.status === 'approved').length;
    const pending = plans.filter(p => p.status === 'pending').length;

    return { total, approved, pending };
  }
}
