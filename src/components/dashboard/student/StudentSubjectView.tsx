import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calculator, FileText, Video, Users, LucideIcon } from "lucide-react";
import { StudentSubject } from "@/hooks/useStudentSubjects";
import { StudentTask } from "@/hooks/useStudentTasks";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Calculator,
  BookOpen,
};

interface StudentSubjectViewProps {
  subject: StudentSubject;
  tasks: StudentTask[];
  onBack: () => void;
  onSelectTask: (task: StudentTask) => void;
}

export function StudentSubjectView({ subject, tasks, onBack, onSelectTask }: StudentSubjectViewProps) {
  const SubjectIcon = iconMap[subject.icon] || BookOpen;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar às Matérias
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${subject.color}`}>
          <SubjectIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">Prof. {subject.teacherName}</p>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="tasks"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
          >
            <FileText className="w-4 h-4" />
            Tarefas
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
          >
            <Video className="w-4 h-4" />
            Conteúdos
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
          >
            <Users className="w-4 h-4" />
            Comentários
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <ScrollArea className="h-[calc(100vh-320px)] pr-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa pendente nesta matéria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => onSelectTask(task)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{task.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">Entrega: {task.dueDate}</Badge>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                          Nota: {task.maxScore}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <ScrollArea className="h-[calc(100vh-320px)] pr-4">
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Conteúdos em breve</p>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <ScrollArea className="h-[calc(100vh-320px)] pr-4">
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Comentários em breve</p>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
