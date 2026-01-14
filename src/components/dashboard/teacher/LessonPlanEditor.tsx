import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, Copy, Check, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LessonPlanEditorProps {
  lessonPlan: string;
  topic: string;
  series?: string;
  bnccObjective?: string;
  onBack: () => void;
}

export function LessonPlanEditor({
  lessonPlan,
  topic,
  series,
  bnccObjective,
  onBack,
}: LessonPlanEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(lessonPlan);
  const [isCopied, setIsCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(content !== lessonPlan);
  }, [content, lessonPlan]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast({
        title: 'Copiado!',
        description: 'O plano de aula foi copiado para a área de transferência.',
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o texto.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-de-aula-${topic.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download iniciado!',
      description: 'O arquivo foi baixado como Markdown.',
    });
  };

  const handleAskAI = (question: string) => {
    if ((window as any).addAIMessage) {
      (window as any).addAIMessage(question);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Plano de Aula
            </h1>
            <p className="text-sm text-muted-foreground">{topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {series && <Badge variant="outline">{series}</Badge>}
          {bnccObjective && (
            <Badge variant="secondary" className="max-w-[200px] truncate">
              {bnccObjective.split(' - ')[0]}
            </Badge>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {isCopied ? 'Copiado' : 'Copiar'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Baixar
        </Button>
        <div className="flex-1" />
        {hasChanges && (
          <Badge variant="outline" className="text-warning border-warning">
            Alterações não salvas
          </Badge>
        )}
      </div>

      {/* Editor */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] h-full resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm leading-relaxed p-4"
              placeholder="Seu plano de aula aparecerá aqui..."
            />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">Ações Rápidas com IA</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAskAI(`Sugira 3 atividades práticas adicionais para complementar este plano de aula sobre "${topic}"`)}
            >
              + Atividades
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAskAI(`Crie 5 perguntas de avaliação para verificar o aprendizado sobre "${topic}"`)}
            >
              + Perguntas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAskAI(`Sugira recursos multimídia (vídeos, imagens, sites) para enriquecer a aula sobre "${topic}"`)}
            >
              + Recursos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAskAI(`Como adaptar este plano de aula sobre "${topic}" para alunos com dificuldades de aprendizagem?`)}
            >
              Adaptações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
