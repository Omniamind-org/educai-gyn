import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { StudentTask } from "@/hooks/useStudentTasks";
import { useToast } from "@/hooks/use-toast";

interface StudentTaskDetailViewProps {
  task: StudentTask;
  onBack: () => void;
}

export function StudentTaskDetailView({ task, onBack }: StudentTaskDetailViewProps) {
  const [responseContent, setResponseContent] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  const handleGrammarCheck = () => {
    const text = responseContent.trim();
    if (!text) {
      toast({
        title: "Texto vazio",
        description: "Escreva seu texto antes de solicitar a revisão.",
        variant: "destructive",
      });
      return;
    }

    const MAX_CHARS = 2800;
    const textToSend = text.length > MAX_CHARS
      ? text.slice(0, MAX_CHARS) + "\n\n[Texto truncado por limite de caracteres. Revise a parte inicial.]"
      : text;

    const sendUserMessage = (window as unknown as { sendUserMessage?: (content: string, displayContent?: string) => void }).sendUserMessage;
    if (sendUserMessage) {
      setIsReviewing(true);
      const prompt = `Por favor, revise o texto abaixo da minha atividade "${task.title}" e dê feedback detalhado sobre:\n- Ortografia e gramática\n- Coesão e coerência entre parágrafos\n- Estrutura do texto\n- Sugestões de melhoria concretas\n\nFaça uma análise real do conteúdo, não use respostas genéricas.\n\n---\n\n${textToSend}`;
      const displayContent = `🔍 Revisar texto: ${task.title}`;
      sendUserMessage(prompt, displayContent);
      setTimeout(() => setIsReviewing(false), 3000);
    } else {
      toast({
        title: "Assistente indisponível",
        description: "Abra o painel da IA Assistente para revisar seu texto.",
        variant: "destructive",
      });
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
            <Button
              onClick={handleGrammarCheck}
              variant="outline"
              className="gap-2"
              disabled={isReviewing || !responseContent.trim()}
            >
              {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
