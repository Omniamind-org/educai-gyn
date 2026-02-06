import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Building, AlertTriangle, CheckCircle2, Hammer, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InfrastructureCensusSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string; // If null, we might need to fetch it or validation fails
}

const CATEGORIES = [
  {
    id: 'classrooms',
    label: 'Salas de Aula',
    items: [
      { id: 'ventilation', label: 'Ventilação (Janelas/Ar-condicionado)' },
      { id: 'lighting', label: 'Iluminação' },
      { id: 'desks', label: 'Carteiras e Mesas' },
      { id: 'boards', label: 'Lousas/Quadros' },
    ]
  },
  {
    id: 'bathrooms',
    label: 'Banheiros',
    items: [
      { id: 'water', label: 'Abastecimento de Água' },
      { id: 'sanitation', label: 'Instalações Sanitárias' },
      { id: 'cleanliness', label: 'Limpeza e Higiene' },
    ]
  },
  {
    id: 'common_areas',
    label: 'Áreas Comuns',
    items: [
      { id: 'kitchen', label: 'Cozinha / Refeitório' },
      { id: 'courtyard', label: 'Pátio / Área de Lazer' },
      { id: 'accessibility', label: 'Acessibilidade (Rampas/Corrimãos)' },
    ]
  },
  {
    id: 'resources',
    label: 'Recursos Específicos',
    items: [
      { id: 'library', label: 'Biblioteca / Sala de Leitura' },
      { id: 'internet', label: 'Conectividade / Internet' },
      { id: 'lab', label: 'Laboratório de Informática' },
    ]
  }
];

export function InfrastructureCensusSheet({ open, onOpenChange, schoolId }: InfrastructureCensusSheetProps) {
  const { toast } = useToast();
  // State now stores objects { status: string, quantity?: number }
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load previous data if available
  useEffect(() => {
    if (open && schoolId) {
      loadLatestCensus();
    }
  }, [open, schoolId]);

  const loadLatestCensus = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('infrastructure_surveys')
        .select('data')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.data) {
        setFormData(data.data as Record<string, any>);
      } else {
        // Init empty
        setFormData({});
      }
    } catch (error) {
      console.error('Error loading census:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (itemId: string, field: 'status' | 'quantity', value: any) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value
      }
    }));
  };

  const calculateScore = () => {
    const totalItems = CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    let goodCount = 0;
    
    Object.values(formData).forEach((val: any) => {
      const status = val?.status;
      if (status === 'good') goodCount++;
      if (status === 'fair') goodCount += 0.5;
    });

    return Math.round((goodCount / totalItems) * 100);
  };

  const handleSubmit = async () => {
    if (!schoolId) {
       toast({
        title: "Erro",
        description: "Escola não identificada. Não é possível salvar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const currentTerm = `${new Date().getFullYear()}.${new Date().getMonth() > 6 ? '2' : '1'}`;
      
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('infrastructure_surveys')
        .insert({
          school_id: schoolId,
          term: currentTerm,
          data: formData,
          score: score,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Censo Atualizado",
        description: `Informações salvas com sucesso! Nota de Infraestrutura: ${score}/100`,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving census:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o censo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (itemId: string) => {
    const status = formData[itemId]?.status;
    if (status === 'good') return 'text-success';
    if (status === 'critical') return 'text-destructive';
    if (status === 'fair') return 'text-warnings';
    return 'text-muted-foreground';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Censo de Infraestrutura Escolar
          </SheetTitle>
          <SheetDescription>
            Avalie as condições físicas da escola para atualizar os indicadores da Regional.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="report" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="report">Relatório Atual</TabsTrigger>
                <TabsTrigger value="edit">Atualizar Dados</TabsTrigger>
              </TabsList>

              <TabsContent value="report" className="space-y-6 mt-4">
                {/* Score Section */}
                <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <div className="mb-2 p-3 bg-background rounded-full shadow-sm">
                    <TrendingUp className={`w-8 h-8 ${calculateScore() >= 80 ? 'text-success' : calculateScore() >= 50 ? 'text-warning' : 'text-destructive'}`} />
                  </div>
                  <h3 className="text-lg font-medium">Nota de Infraestrutura</h3>
                  <div className="text-4xl font-bold my-2">{calculateScore()}/100</div>
                  <p className="text-sm text-muted-foreground">Baseado nos dados salvos</p>
                </div>

                {/* Status Cards */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Destaques</h4>
                  {CATEGORIES.flatMap(cat => cat.items).filter(item => formData[item.id]?.status).map(item => {
                     const data = formData[item.id];
                     const status = data?.status;
                     const statusConfig = {
                        good: { label: 'ATIVA', class: 'bg-success/10 text-success' },
                        fair: { label: 'MANUTENÇÃO', class: 'bg-warning/10 text-warning' },
                        critical: { label: 'CRÍTICO', class: 'bg-destructive/10 text-destructive' },
                        na: { label: 'N/A', class: 'bg-muted text-muted-foreground' }
                      }[status as string] || { label: 'DESCONHECIDO', class: 'bg-muted' };

                     return (
                       <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                         <div>
                           <p className="font-medium text-sm">{item.label}</p>
                           {data.quantity && <p className="text-xs text-muted-foreground mt-0.5">Quantidade: {data.quantity}</p>}
                         </div>
                         <Badge className={statusConfig.class}>{statusConfig.label}</Badge>
                       </div>
                     );
                  })}
                  {Object.keys(formData).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">Nenhum dado registrado.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="edit">
                <Accordion type="single" collapsible className="w-full" defaultValue="classrooms">
                  {CATEGORIES.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{category.label}</span>
                          {category.items.every(i => formData[i.id]?.status) && (
                             <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6 pt-2">
                          {category.items.map((item) => (
                            <div key={item.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                              <div className="flex items-center justify-between">
                                <Label className="text-base">{item.label}</Label>
                                <AlertTriangle className={`w-4 h-4 ${getStatusColor(item.id)} opacity-50`} />
                              </div>
                              
                              <RadioGroup 
                                value={formData[item.id]?.status || ''} 
                                onValueChange={(val) => handleValueChange(item.id, 'status', val)}
                                className="flex flex-col sm:flex-row gap-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="good" id={`${item.id}-good`} />
                                  <Label htmlFor={`${item.id}-good`} className="cursor-pointer text-success">Bom</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="fair" id={`${item.id}-fair`} />
                                  <Label htmlFor={`${item.id}-fair`} className="cursor-pointer text-warning">Regular</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="critical" id={`${item.id}-critical`} />
                                  <Label htmlFor={`${item.id}-critical`} className="cursor-pointer text-destructive font-semibold">Crítico</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="na" id={`${item.id}-na`} />
                                  <Label htmlFor={`${item.id}-na`} className="cursor-pointer text-muted-foreground">Não se aplica</Label>
                                </div>
                              </RadioGroup>

                              {/* Conditional Inputs for Quantity */}
                              {item.id === 'library' && (
                                <div className="mt-2">
                                  <Label className="text-sm text-muted-foreground">Quantidade de Livros (Acervo)</Label>
                                  <Input 
                                    type="number" 
                                    placeholder="Total de livros" 
                                    value={formData[item.id]?.quantity || ''}
                                    onChange={(e) => handleValueChange(item.id, 'quantity', parseInt(e.target.value))}
                                    className="mt-1"
                                  />
                                </div>
                              )}

                              {item.id === 'lab' && (
                                <div className="mt-2">
                                  <Label className="text-sm text-muted-foreground">Total de Computadores</Label>
                                  <Input 
                                    type="number" 
                                    placeholder="Máquinas disponíveis" 
                                    value={formData[item.id]?.quantity || ''}
                                    onChange={(e) => handleValueChange(item.id, 'quantity', parseInt(e.target.value))}
                                    className="mt-1"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div className="mt-6">
                   <Button onClick={handleSubmit} disabled={isSubmitting || isLoading} className="w-full gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Censo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <SheetFooter className="mt-6 border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
