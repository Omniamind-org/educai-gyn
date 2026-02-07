import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy } from "lucide-react";
import { STUDENT_CONTEXT } from "@/data/studentData";
import { StudentProfile } from "@/hooks/useStudentProfile";

interface StudentGamificationBarProps {
  profile: StudentProfile | null;
}

export function StudentGamificationBar({ profile }: StudentGamificationBarProps) {
  return (
    <div className="p-3 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10 border-2 border-primary shrink-0">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'student'}`} />
          <AvatarFallback>{profile?.name?.substring(0, 2).toUpperCase() || 'AL'}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm truncate max-w-[120px]">
          {profile?.name?.split(' ')[0] || 'Aluno'}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <Trophy className="w-4 h-4 text-warning" />
          <span className="font-semibold text-xs">Nível {STUDENT_CONTEXT.level}</span>
        </div>

        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="text-xs text-muted-foreground shrink-0">XP</span>
          <span className="text-xs font-medium shrink-0">{STUDENT_CONTEXT.xp.toLocaleString()}/2k</span>
          <Progress value={(STUDENT_CONTEXT.xp / 2000) * 100} className="h-1.5 flex-1 min-w-[40px]" />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Flame className="w-4 h-4 text-destructive" />
          <span className="font-semibold text-xs">{STUDENT_CONTEXT.streak} Dias</span>
        </div>
      </div>
    </div>
  );
}
