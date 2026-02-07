import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Loader2 } from "lucide-react";
import { StudentTask } from "@/hooks/useStudentTasks";

interface StudentTasksListProps {
  tasks: StudentTask[];
  loading: boolean;
  onTaskClick: (task: StudentTask) => void;
}

export function StudentTasksList({ tasks, loading, onTaskClick }: StudentTasksListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Atividades Pendentes ({tasks.length})
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando tarefas...</span>
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Nenhuma tarefa pendente</h3>
            <p className="text-muted-foreground">
              Você está em dia! Novas tarefas aparecerão aqui quando seus professores as criarem.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task, index) => (
            <Card
              key={task.id}
              className="activity-card opacity-0 animate-fade-in cursor-pointer hover:border-primary/50 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => onTaskClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{task.className}</span>
                      <Badge variant="outline" className="text-xs">
                        Entrega: {task.dueDate}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    Nota: {task.maxScore}
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
