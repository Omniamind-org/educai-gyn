import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star } from "lucide-react";
import { StudentTask } from "@/hooks/useStudentTasks";

interface StudentTaskDetailViewProps {
  task: StudentTask;
  onBack: () => void;
}

export function StudentTaskDetailView({ task, onBack }: StudentTaskDetailViewProps) {
  const [responseContent, setResponseContent] = useState('');

  const handleGrammarCheck = () => {
    if (window.addAIMessage) {
      window.addAIMessage(
        '🔍 Analisando seu texto... Encontrei algumas sugestões:\n\n• Considere revisar a estrutura do texto\n• Verifique a coesão entre os parágrafos\n• Boa organização! Continue assim!'
      );
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="gap-2 mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar às Atividades
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                {task.className}
              </Badge>
              <CardTitle className="text-xl">{task.title}</CardTitle>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
              )}
            </div>
            <Badge variant="outline" className="gap-1">
              <Star className="w-3 h-3" />
              Nota máx: {task.maxScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Escreva sua resposta aqui..."
            className="min-h-[300px] resize-none"
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={handleGrammarCheck} variant="outline" className="gap-2">
              🔍 Revisar Texto
            </Button>
            <Button className="gap-2">
              Enviar Atividade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
