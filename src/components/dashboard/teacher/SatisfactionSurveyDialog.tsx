import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2, Heart, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SatisfactionSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  campaignId: string;
  campaignTitle: string;
}

export function SatisfactionSurveyDialog({ open, onOpenChange, teacherId, campaignId, campaignTitle }: SatisfactionSurveyDialogProps) {
  const { toast } = useToast();
  const [score, setScore] = useState([7]); // Default NPS 7
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!teacherId || !campaignId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('climate_surveys')
        .insert({
          teacher_id: teacherId,
          campaign_id: campaignId,
          nps_score: score[0],
          feedback: feedback.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Obrigado!",
        description: "Sua opinião é muito importante para melhorarmos a rede.",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua resposta.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (val: number) => {
    if (val <= 6) return 'text-destructive';
    if (val <= 8) return 'text-warning';
    return 'text-success';
  };

  const getScoreLabel = (val: number) => {
    if (val <= 6) return 'Detrator';
    if (val <= 8) return 'Neutro';
    return 'Promotor';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20" />
            {campaignTitle}
          </DialogTitle>
          <DialogDescription>
            De 0 a 10, o quanto você recomendaria esta escola como um bom lugar para trabalhar?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-muted-foreground">0 - Não recomendo</span>
              <span className={`text-2xl font-bold ${getScoreColor(score[0])}`}>{score[0]}</span>
              <span className="text-xs text-muted-foreground">10 - Recomendo muito</span>
            </div>
            
            <Slider
              value={score}
              onValueChange={setScore}
              max={10}
              step={1}
              className="py-2"
            />
            
            <p className="text-center text-sm font-medium text-muted-foreground">
              Você é um <span className={getScoreColor(score[0])}>{getScoreLabel(score[0])}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Algum comentário adicional? (Opcional)</Label>
            <Textarea
              id="feedback"
              placeholder="Conte-nos mais sobre sua experiência..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Talvez depois</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar Resposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
