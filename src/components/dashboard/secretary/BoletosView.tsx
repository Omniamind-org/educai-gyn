import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, Printer, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";

interface Boleto {
  id: string;
  student_id: string;
  studentName?: string;
  value: number;
  due_date: string;
  status: "pendente" | "pago" | "vencido";
  reference: string;
  paid_at?: string | null;
}

export function BoletosView() {
  const { toast } = useToast();
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [students, setStudents] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddBoletoOpen, setIsAddBoletoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newBoleto, setNewBoleto] = useState({
    student_id: "",
    value: "",
    due_date: "",
    reference: "",
  });

  useEffect(() => {
    fetchBoletos();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from("students").select("id, name").eq("status", "ativo");
    setStudents(data || []);
  };

  const fetchBoletos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("boletos")
      .select("*, students(name)")
      .order("due_date", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os boletos.",
        variant: "destructive",
      });
    } else {
      const today = new Date();
      const mappedBoletos = (data || []).map((b: any) => {
        let status = b.status;
        if (status === "pendente" && new Date(b.due_date) < today) {
          status = "vencido";
        }
        return {
          ...b,
          studentName: b.students?.name || "Aluno não encontrado",
          status,
        };
      });
      setBoletos(mappedBoletos);
    }
    setIsLoading(false);
  };

  const handleAddBoleto = async () => {
    if (!newBoleto.student_id || !newBoleto.value || !newBoleto.due_date || !newBoleto.reference) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("boletos").insert({
        student_id: newBoleto.student_id,
        value: parseFloat(newBoleto.value),
        due_date: newBoleto.due_date,
        reference: newBoleto.reference,
        status: "pendente",
      });

      if (error) throw error;

      await fetchBoletos();
      setNewBoleto({ student_id: "", value: "", due_date: "", reference: "" });
      setIsAddBoletoOpen(false);

      toast({
        title: "Boleto criado!",
        description: "O boleto foi registrado com sucesso.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar boleto";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (boletoId: string) => {
    try {
      const { error } = await supabase
        .from("boletos")
        .update({ status: "pago", paid_at: new Date().toISOString() })
        .eq("id", boletoId);

      if (error) throw error;

      await fetchBoletos();
      toast({
        title: "Boleto pago!",
        description: "O status foi atualizado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o boleto.",
        variant: "destructive",
      });
    }
  };

  const handlePrintBoleto = (boleto: Boleto) => {
    const printContent = `
      ===============================
      BOLETO DE MENSALIDADE
      ===============================
      Aluno: ${boleto.studentName || "N/A"}
      Referência: ${boleto.reference}
      Valor: R$ ${boleto.value.toFixed(2)}
      Vencimento: ${new Date(boleto.due_date).toLocaleDateString("pt-BR")}
      Status: ${boleto.status.toUpperCase()}
      ===============================
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Boleto - ${boleto.studentName || "Aluno"}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    toast({
      title: "Imprimindo",
      description: `Boleto de ${boleto.studentName || "aluno"} enviado para impressão.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pago: "default",
      pendente: "outline",
      vencido: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const filteredBoletos = boletos.filter((boleto) =>
    (boleto.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    boleto.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Boletos Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boletos.filter((b) => b.status === "pendente").length}
            </div>
            <p className="text-xs text-muted-foreground">aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Boletos Vencidos</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {boletos.filter((b) => b.status === "vencido").length}
            </div>
            <p className="text-xs text-muted-foreground">necessitam atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno ou referência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[250px] md:w-[350px]"
          />
        </div>

        <Dialog open={isAddBoletoOpen} onOpenChange={setIsAddBoletoOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Boleto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Novo Boleto</DialogTitle>
              <DialogDescription>
                Preencha os dados de cobrança.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Aluno *</Label>
                <Select
                  value={newBoleto.student_id}
                  onValueChange={(value) => setNewBoleto({ ...newBoleto, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referência *</Label>
                <Input
                  id="reference"
                  value={newBoleto.reference}
                  onChange={(e) => setNewBoleto({ ...newBoleto, reference: e.target.value })}
                  placeholder="Ex: Mensalidade Janeiro/2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={newBoleto.value}
                  onChange={(e) => setNewBoleto({ ...newBoleto, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Vencimento *</Label>
                <DatePicker
                  id="due_date"
                  value={newBoleto.due_date}
                  onChange={(value) => setNewBoleto({ ...newBoleto, due_date: value })}
                  placeholder="DD/MM/AAAA"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleAddBoleto} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Boleto"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Ref.</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredBoletos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum boleto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredBoletos.map((boleto) => (
                <TableRow key={boleto.id}>
                  <TableCell className="font-medium">{boleto.studentName}</TableCell>
                  <TableCell>{boleto.reference}</TableCell>
                  <TableCell>R$ {boleto.value.toFixed(2)}</TableCell>
                  <TableCell>{new Date(boleto.due_date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{getStatusBadge(boleto.status)}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePrintBoleto(boleto)}
                      title="Imprimir"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    {boleto.status !== "pago" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsPaid(boleto.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Marcar como Pago"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
