import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SurveyCampaignManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Campaign {
  id: string;
  title: string;
  target_role: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export function SurveyCampaignManager({ open, onOpenChange }: SurveyCampaignManagerProps) {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Campaign Form
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    target_role: 'professor',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (open) {
      fetchCampaigns();
    }
  }, [open]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as campanhas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCampaign.title || !newCampaign.start_date || !newCampaign.end_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a campanha.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('survey_campaigns')
        .insert({
          title: newCampaign.title,
          target_role: newCampaign.target_role as any,
          start_date: newCampaign.start_date,
          end_date: newCampaign.end_date,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Campanha Criada",
        description: "A pesquisa já está disponível para o público alvo.",
      });

      // Reset form
      setNewCampaign({
        title: '',
        target_role: 'professor',
        start_date: '',
        end_date: '',
      });
      
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a campanha.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('survey_campaigns')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ));

    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso apagará todas as respostas associadas.')) return;
    
    try {
       const { error } = await supabase
        .from('survey_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCampaigns(prev => prev.filter(c => c.id !== id));
       toast({
        title: "Excluído",
        description: "Campanha removida com sucesso.",
      });
    } catch (error) {
       console.error('Error deleting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciador de Pesquisas de Clima</DialogTitle>
          <DialogDescription>
            Crie e gerencie períodos de avaliação de satisfação para a rede.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Create Form */}
          <div className="md:col-span-1 space-y-4 border-r pr-0 md:pr-6 border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nova Campanha
            </h3>
            
            <div className="space-y-2">
              <Label>Título</Label>
              <Input 
                placeholder="Ex: Clima 1º Semestre 2024" 
                value={newCampaign.title}
                onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Público Alvo</Label>
              <Select 
                value={newCampaign.target_role} 
                onValueChange={v => setNewCampaign({...newCampaign, target_role: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professores</SelectItem>
                  <SelectItem value="diretor">Diretores</SelectItem>
                  <SelectItem value="aluno">Alunos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Início</Label>
                <Input type="date" value={newCampaign.start_date} onChange={e => setNewCampaign({...newCampaign, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Input type="date" value={newCampaign.end_date} onChange={e => setNewCampaign({...newCampaign, end_date: e.target.value})} />
              </div>
            </div>

            <Button onClick={handleCreate} disabled={isCreating} className="w-full">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Campanha"}
            </Button>
          </div>

          {/* List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Histórico
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhuma campanha encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((camp) => (
                        <TableRow key={camp.id}>
                          <TableCell className="font-medium">
                            {camp.title}
                            <div className="text-xs text-muted-foreground capitalize">{camp.target_role}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(camp.start_date), 'dd/MM/yy')} - {format(new Date(camp.end_date), 'dd/MM/yy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={camp.is_active} 
                                onCheckedChange={() => toggleStatus(camp.id, camp.is_active)}
                              />
                              <span className="text-xs text-muted-foreground">
                                {camp.is_active ? 'Ativa' : 'Inativa'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(camp.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
