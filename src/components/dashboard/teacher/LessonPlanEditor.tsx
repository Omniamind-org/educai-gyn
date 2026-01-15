import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Download, Copy, Check, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface LessonPlanEditorProps {
  planId?: string;
  lessonPlan: string;
  topic: string;
  series?: string;
  bnccObjective?: string;
  teacherId?: string | null;
  onBack: () => void;
  onSaved?: (id: string) => void;
}

export function LessonPlanEditor({
  planId,
  lessonPlan,
  topic,
  series,
  bnccObjective,
  teacherId,
  onBack,
  onSaved,
}: LessonPlanEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(lessonPlan);
  const [isCopied, setIsCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | undefined>(planId);

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
      doc.text(`Plano de Aula: ${topic}`, margin, 20);
      
      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 30;
      
      if (series) {
        doc.text(`Série: ${series}`, margin, yPos);
        yPos += 6;
      }
      if (bnccObjective) {
        doc.text(`Objetivo BNCC: ${bnccObjective}`, margin, yPos);
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
      
      doc.save(`plano-de-aula-${topic.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
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
      if (savedPlanId) {
        // Update existing plan
        const { error } = await supabase
          .from('lesson_plans')
          .update({
            content,
            topic,
            series: series || null,
            bncc_objective: bnccObjective || null,
          })
          .eq('id', savedPlanId);

        if (error) throw error;
        setHasChanges(false);
        toast({
          title: 'Plano atualizado!',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        // Create new plan
        const { data, error } = await supabase
          .from('lesson_plans')
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
        setSavedPlanId(data.id);
        setHasChanges(false);
        onSaved?.(data.id);
        toast({
          title: 'Plano salvo!',
          description: 'O plano de aula foi salvo com sucesso.',
        });
      }
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o plano de aula.',
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
          {savedPlanId ? 'Atualizar' : 'Salvar'}
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
        {savedPlanId && (
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
