import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calculator, FileText, Loader2, LucideIcon } from "lucide-react";
import { StudentSubject } from "@/hooks/useStudentSubjects";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Calculator,
  BookOpen,
};

interface StudentSubjectsListProps {
  subjects: StudentSubject[];
  loading: boolean;
  onSubjectClick: (subject: StudentSubject) => void;
}

export function StudentSubjectsList({ subjects, loading, onSubjectClick }: StudentSubjectsListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        Minhas Matérias
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando matérias...</span>
        </div>
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Nenhuma matéria disponível</h3>
            <p className="text-muted-foreground">
              Suas matérias aparecerão aqui quando você for matriculado em uma turma.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((subject, index) => {
            const SubjectIcon = iconMap[subject.icon] || BookOpen;
            return (
              <Card
                key={subject.id}
                className="cursor-pointer hover:border-primary/50 transition-all hover:scale-105 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onSubjectClick(subject)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className={`p-4 rounded-xl mb-3 ${subject.color}`}>
                    <SubjectIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Prof. {subject.teacherName}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
