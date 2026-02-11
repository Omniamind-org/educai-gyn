import { MessageSquare, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TeacherSurveyAlertProps {
  activeCampaign: { id: string; title: string } | null;
  isVisible: boolean;
  onOpenSurvey: () => void;
  onCloseAlert: () => void;
}

export function TeacherSurveyAlert({ activeCampaign, isVisible, onOpenSurvey, onCloseAlert }: TeacherSurveyAlertProps) {
  if (!isVisible || !activeCampaign) return null;

  return (
    <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-primary">Pesquisa de Clima Disponível</h3>
            <p className="text-muted-foreground">Sua opinião é fundamental! Participe da {activeCampaign.title}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onOpenSurvey}>
            Participar Agora
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onCloseAlert}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
