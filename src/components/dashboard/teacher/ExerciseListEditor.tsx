import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, Copy, Check, ListChecks, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseListEditorProps {
  listId?: string;
  exerciseList: string;
  topic: string;
  series?: string;
  bnccObjective?: string;
  teacherId?: string | null;
  onBack: () => void;
  onSaved?: (id: string) => void;
}

export function ExerciseListEditor({
  listId,
  exerciseList,
  topic,
  series,
  bnccObjective,
  teacherId,
  onBack,
  onSaved,
}: ExerciseListEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(exerciseList);
  const [isCopied, setIsCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedListId, setSavedListId] = useState<string | undefined>(listId);

  useEffect(() => {
    setHasChanges(content !== exerciseList);
  }, [content, exerciseList]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast({
        title: 'Copiado!',
        description: 'A lista de exercícios foi copiada para a área de transferência.',
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

  const handleDownload = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`Lista de Exercícios: ${topic}`, margin, 20);
      
      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 30;
      
      if (series) {
        doc.text(`Série: ${series}`, margin, yPos);
        yPos += 6;
      }
      if (bnccObjective) {
        doc.text(`Habilidade BNCC: ${bnccObjective}`, margin, yPos);
        yPos += 6;
      }
      
      yPos += 8;
      
      // Content
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(content, maxWidth);
      
      for (const line of lines) {
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 6;
      }
      
      doc.save(`lista-exercicios-${topic.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: 'Download iniciado!',
        description: 'O arquivo foi baixado como PDF.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleAskAI = (question: string) => {
    if ((window as any).addAIMessage) {
      (window as any).addAIMessage(question);
    }
  };

  const handleSave = async () => {
    if (!teacherId) {
      toast({
        title: 'Erro',
        description: 'Não foi possível identificar o professor.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (savedListId) {
        // Update existing list
        const { error } = await supabase
          .from('exercise_lists')
          .update({
            content,
            topic,
            series: series || null,
            bncc_objective: bnccObjective || null,
          })
          .eq('id', savedListId);

        if (error) throw error;
        setHasChanges(false);
        toast({
          title: 'Lista atualizada!',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        // Create new list
        const { data, error } = await supabase
          .from('exercise_lists')
          .insert({
            teacher_id: teacherId,
            content,
            topic,
            series: series || null,
            bncc_objective: bnccObjective || null,
          })
          .select('id')
          .single();

        if (error) throw error;
        setSavedListId(data.id);
        setHasChanges(false);
        onSaved?.(data.id);
        toast({
          title: 'Lista salva!',
          description: 'A lista de exercícios foi salva com sucesso.',
        });
      }
    } catch (error) {
      console.error('Error saving exercise list:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a lista de exercícios.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
              <ListChecks className="h-5 w-5 text-primary" />
              Lista de Exercícios
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
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleSave} 
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {savedListId ? 'Atualizar' : 'Salvar'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {isCopied ? 'Copiado' : 'Copiar'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Baixar
        </Button>
        <div className="flex-1" />
        {savedListId && (
          <Badge variant="secondary" className="text-xs">
            Salvo
          </Badge>
        )}
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
              placeholder="Sua lista de exercícios aparecerá aqui..."
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
              onClick={() => handleAskAI(`Adicione mais 5 exercícios sobre "${topic}" com nível de dificuldade crescente`)}
            >
              + Exercícios
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAskAI(`Crie uma versão simplificada dos exercícios sobre "${topic}" para alunos com dificuldades`)}
            >
              Versão Simplificada
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAskAI(`Sugira exercícios de revisão rápida sobre "${topic}" para fazer em 5 minutos`)}
            >
              Revisão Rápida
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAskAI(`Crie exercícios desafiadores (nível avançado) sobre "${topic}" para alunos de destaque`)}
            >
              Desafios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
