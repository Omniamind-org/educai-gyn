import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Cpu, AlertTriangle, CheckCircle2, Loader2, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface SmartPddeEventDetail {
  amount: number;
}

export function SmartPddeAgentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleIntent = (e: Event) => {
      const customEvent = e as CustomEvent<SmartPddeEventDetail>;
      if (customEvent.detail && customEvent.detail.amount) {
        setAmount(customEvent.detail.amount);
        setIsProcessing(true);
        setIsOpen(true);
        
        // Simular varredura de dados
        setTimeout(() => {
          setIsProcessing(false);
        }, 1800);
      }
    };

    window.addEventListener("smartPddeIntent", handleIntent);
    return () => window.removeEventListener("smartPddeIntent", handleIntent);
  }, []);

  const handleGenerateDocument = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsOpen(false);
      toast({
        title: "Ofício Gerado com Sucesso",
        description: "A Ata de Justificativa de Gastos foi salva e assinada digitalmente.",
      });
    }, 2500);
  };

  if (!isOpen) return null;

  // Calculo simplificado para a demontração Visual WOW
  const infraShare = amount * 0.65;
  const labShare = amount * 0.35;

  const pieData = [
    { name: "Reparos Críticos", value: infraShare, color: "#e11d48" },
    { name: "Kits de Laboratório", value: labShare, color: "#2563eb" },
  ];

  const barData = [
    { name: "Cenário Atual", ideb: 4.2 },
    { name: "Pós-Investimento", ideb: 4.6 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <Cpu className="w-8 h-8 text-primary" />
            Copiloto PDDE
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Análise Inteligente de Necessidades e Alocação de Verbas (Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)})
          </DialogDescription>
        </DialogHeader>

        {isProcessing ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h3 className="text-xl font-medium">Analisando Infraestrutura e Notas da Escola...</h3>
            <p className="text-sm text-muted-foreground w-3/4 text-center">
              Cruzando dados de defeitos prediais reportados com o desempenho histórico dos alunos em Ciências e Matemática...
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-4 animate-fade-in">
            {/* Contexto da IA */}
            <div className="bg-muted/50 p-4 rounded-xl border border-border">
              <h4 className="flex items-center gap-2 font-semibold text-primary mb-2">
                <Info className="w-4 h-4" /> Diagnóstico da IA
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Identifiquei <strong className="text-foreground">2 vulnerabilidades</strong> na nossa rede: 
                vazamentos no Bloco C (Infraestrutura) e queda contínua de -15% nas notas de Ciências no 9º ano. 
                Estou sugerindo um investimento agressivo para neutralizar estes dois focos visando o próximo exame nacional.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Gráfico de Alocação */}
              <Card className="border shadow-sm">
                <CardContent className="p-4 pt-6 flex flex-col items-center">
                  <h4 className="font-semibold text-sm mb-4">Proposta de Divisão</h4>
                  <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-600"></div> Infra</span>
                      <span className="font-bold text-rose-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(infraShare)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Laboratório</span>
                      <span className="font-bold text-blue-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(labShare)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Impacto Simulado */}
              <Card className="border shadow-sm">
                <CardContent className="p-4 pt-6">
                  <h4 className="font-semibold text-sm mb-4">Impacto IDEB Estimado</h4>
                   <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} domain={[0, 6]} tick={{ fontSize: 11 }} />
                        <RechartsTooltip />
                        <Bar dataKey="ideb" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                     <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none">
                       +0.4 Pontos
                     </Badge>
                     <span className="text-xs text-muted-foreground">Projeção de Melhoria</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Mitigadas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <div>
                    <h5 className="font-medium text-sm">Problema: Infiltração Bloco C</h5>
                    <p className="text-xs text-muted-foreground">Risco de interdição e multa sanitária.</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Mitigado (R$ {infraShare})
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <h5 className="font-medium text-sm">Problema: Defasagem em Ciências (9º Ano)</h5>
                    <p className="text-xs text-muted-foreground">Média bimestral caiu para 4.1. Falta experimentação.</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Mitigado (R$ {labShare})
                </Badge>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating || isProcessing}>
            Cancelar
          </Button>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[250px]" 
            onClick={handleGenerateDocument}
            disabled={isGenerating || isProcessing}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Gerando Ata e Assinatura... 
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" /> Aprovar Orçamento e Gerar Ata
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
