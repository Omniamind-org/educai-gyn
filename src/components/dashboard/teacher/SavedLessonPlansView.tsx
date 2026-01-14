import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, Search, Trash2, Eye, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LessonPlan {
  id: string;
  topic: string;
  series: string | null;
  bncc_objective: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface SavedLessonPlansViewProps {
  teacherId: string;
  onBack: () => void;
  onOpenPlan: (plan: LessonPlan) => void;
}

export function SavedLessonPlansView({
  teacherId,
  onBack,
  onOpenPlan,
}: SavedLessonPlansViewProps) {
  const { toast } = useToast();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planToDelete, setPlanToDelete] = useState<LessonPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [teacherId]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos de aula.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', planToDelete.id);

      if (error) throw error;

      setPlans(plans.filter(p => p.id !== planToDelete.id));
      toast({
        title: 'Plano excluído',
        description: 'O plano de aula foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plano de aula.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setPlanToDelete(null);
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.series && plan.series.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (plan.bncc_objective && plan.bncc_objective.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Meus Planos de Aula
            </h1>
            <p className="text-sm text-muted-foreground">
              {plans.length} {plans.length === 1 ? 'plano salvo' : 'planos salvos'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar planos por tema, série ou objetivo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Plans List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {searchQuery ? (
              <>
                <p className="text-lg font-medium">Nenhum plano encontrado</p>
                <p className="text-sm">Tente buscar com outros termos.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">Nenhum plano de aula salvo</p>
                <p className="text-sm">Gere um plano de aula e salve para vê-lo aqui.</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredPlans.map((plan, index) => (
            <Card
              key={plan.id}
              className="activity-card opacity-0 animate-fade-in hover:border-primary/50 transition-all cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onOpenPlan(plan)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{plan.topic}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {plan.series && (
                          <Badge variant="outline" className="text-xs">
                            {plan.series}
                          </Badge>
                        )}
                        {plan.bncc_objective && (
                          <Badge variant="secondary" className="text-xs">
                            {plan.bncc_objective.split(' - ')[0]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado em {format(new Date(plan.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPlan(plan);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlanToDelete(plan);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano de aula?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O plano "{planToDelete?.topic}" será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
