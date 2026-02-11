import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Hammer } from "lucide-react";
import { STATUS_LABELS } from "@/constants/director";
import { Project } from "@/types/director";

interface DirectorProjectsListProps {
  projects: readonly Project[];
  onOpenCensus: () => void;
}

export function DirectorProjectsList({ projects, onOpenCensus }: DirectorProjectsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Hammer className="w-5 h-5 text-warning" />
            Obras e Recursos
          </CardTitle>
          <Button size="sm" variant="outline" onClick={onOpenCensus}>
            Atualizar Censo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{project.title}</h4>
                <Badge className={STATUS_LABELS[project.status].className}>
                  {STATUS_LABELS[project.status].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{project.budget}</span>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="w-20 h-2 bg-muted [&>div]:bg-primary" />
                  <span className="text-xs font-medium">{project.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
