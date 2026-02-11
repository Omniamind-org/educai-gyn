import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Discipline } from '@/types/teacher';

interface TeacherDisciplinesCardProps {
  disciplines: Discipline[];
}

export function TeacherDisciplinesCard({ disciplines }: TeacherDisciplinesCardProps) {
  if (!disciplines || disciplines.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="w-5 h-5 text-primary" />
          Minhas Disciplinas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {disciplines.map((disc) => (
            <Badge key={disc.id} variant="secondary" className="text-sm px-3 py-1">
              {disc.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
