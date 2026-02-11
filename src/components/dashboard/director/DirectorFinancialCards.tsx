import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DashboardStats } from "@/types/director";

interface DirectorFinancialCardsProps {
  stats: DashboardStats | null;
  onGenerateDocument: (prompt: string, input: string) => void;
}

export function DirectorFinancialCards({ stats, onGenerateDocument }: DirectorFinancialCardsProps) {
  const [documentInput, setDocumentInput] = useState('');

  const handleGenerate = () => {
    if (!documentInput.trim()) return;
    const prompt = `Gere um documento formal: "${documentInput}". Peça os dados necessários (como nomes, datas, detalhes) se não estiverem claros. Quando tiver todos os dados, gere o documento final completo dentro de tags <document> e </document> para que eu possa gerar o PDF.`;
    onGenerateDocument(prompt, documentInput);
    setDocumentInput('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Boletos Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-primary" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground">Boletos Pagos</p>
              <p className="text-2xl font-bold text-success">{stats?.boletosPagos || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                R$ {(stats?.totalReceita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-warning">{stats?.boletosPendentes || 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-muted-foreground">Vencidos</p>
              <p className="text-2xl font-bold text-destructive">{stats?.boletosVencidos || 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground">Total de Boletos</p>
              <p className="text-2xl font-bold">{stats?.totalBoletos || 0}</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Receita Pendente</span>
              <span className="font-semibold text-warning">
                R$ {(stats?.receitaPendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-primary" />
            Burocracia Zero
          </CardTitle>
          <CardDescription>
            Gere documentos formais automaticamente com IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Ex: Advertência João Silva, Declaração de Matrícula..."
              value={documentInput}
              onChange={(e) => setDocumentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button onClick={handleGenerate} className="w-full gap-2">
              <FileText className="w-4 h-4" />
              Gerar Documento
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Documentos recentes:</p>
            <div className="space-y-2">
              {['Ata de Reunião - 20/12', 'Declaração Maria Santos', 'Ofício Secretaria'].map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {doc}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
