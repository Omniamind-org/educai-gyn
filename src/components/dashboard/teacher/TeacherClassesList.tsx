import { Users, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClassWithDetails } from '@/types/teacher';

interface TeacherClassesListProps {
  classes: ClassWithDetails[];
  isLoading: boolean;
  onSelectClass: (cls: ClassWithDetails) => void;
}

export function TeacherClassesList({ classes, isLoading, onSelectClass }: TeacherClassesListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Minhas Turmas
      </h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma turma atribuída</p>
            <p className="text-sm">A secretaria ainda não atribuiu turmas para você.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map((cls, index) => (
            <Card 
              key={cls.id}
              className="activity-card opacity-0 animate-fade-in cursor-pointer hover:border-primary/50 transition-all"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => onSelectClass(cls)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-success/10">
                    <BookOpen className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">{cls.grade}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-card">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${cls.id}${i}`} />
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-muted-foreground">{cls.student_count} alunos</span>
                  </div>
                  
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {cls.year}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
