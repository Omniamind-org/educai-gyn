import { useState, useEffect } from 'react';
import { ArrowLeft, ListChecks, Calendar, Search, Trash2, Eye, Loader2, FolderOpen } from 'lucide-react';
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

interface ExerciseList {
  id: string;
  topic: string;
  series: string | null;
  bncc_objective: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface SavedExerciseListsViewProps {
  teacherId: string;
  onBack: () => void;
  onOpenList: (list: ExerciseList) => void;
}

export function SavedExerciseListsView({
  teacherId,
  onBack,
  onOpenList,
}: SavedExerciseListsViewProps) {
  const { toast } = useToast();
  const [lists, setLists] = useState<ExerciseList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [listToDelete, setListToDelete] = useState<ExerciseList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLists();
  }, [teacherId]);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercise_lists')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching exercise lists:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as listas de exercícios.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('exercise_lists')
        .delete()
        .eq('id', listToDelete.id);

      if (error) throw error;

      setLists(lists.filter(l => l.id !== listToDelete.id));
      toast({
        title: 'Lista excluída',
        description: 'A lista de exercícios foi excluída com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting exercise list:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a lista de exercícios.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setListToDelete(null);
    }
  };

  const filteredLists = lists.filter(list =>
    list.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (list.series && list.series.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (list.bncc_objective && list.bncc_objective.toLowerCase().includes(searchQuery.toLowerCase()))
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
              Minhas Listas de Exercícios
            </h1>
            <p className="text-sm text-muted-foreground">
              {lists.length} {lists.length === 1 ? 'lista salva' : 'listas salvas'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar listas por tema, série ou habilidade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lists */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredLists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {searchQuery ? (
              <>
                <p className="text-lg font-medium">Nenhuma lista encontrada</p>
                <p className="text-sm">Tente buscar com outros termos.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">Nenhuma lista de exercícios salva</p>
                <p className="text-sm">Gere uma lista de exercícios e salve para vê-la aqui.</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredLists.map((list, index) => (
            <Card
              key={list.id}
              className="activity-card opacity-0 animate-fade-in hover:border-primary/50 transition-all cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onOpenList(list)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{list.topic}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {list.series && (
                          <Badge variant="outline" className="text-xs">
                            {list.series}
                          </Badge>
                        )}
                        {list.bncc_objective && (
                          <Badge variant="secondary" className="text-xs">
                            {list.bncc_objective.split(' - ')[0]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criada em {format(new Date(list.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
                        onOpenList(list);
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
                        setListToDelete(list);
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
      <AlertDialog open={!!listToDelete} onOpenChange={() => setListToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista de exercícios?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A lista "{listToDelete?.topic}" será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
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
