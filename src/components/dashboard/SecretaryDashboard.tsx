import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Printer, Users, FileText, Search, Plus, Copy, Key, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  grade: string;
  status: string;
  created_at: string;
}

interface Boleto {
  id: string;
  studentName: string;
  value: number;
  dueDate: string;
  status: "pendente" | "pago" | "vencido";
  reference: string;
}

// Mock boletos (could be moved to database later)
const MOCK_BOLETOS: Boleto[] = [
  { id: "1", studentName: "João Silva", value: 450.00, dueDate: "2024-02-10", status: "pago", reference: "2024/02" },
  { id: "2", studentName: "Maria Santos", value: 450.00, dueDate: "2024-02-10", status: "pendente", reference: "2024/02" },
  { id: "3", studentName: "João Silva", value: 450.00, dueDate: "2024-03-10", status: "pendente", reference: "2024/03" },
  { id: "4", studentName: "Pedro Oliveira", value: 450.00, dueDate: "2024-01-10", status: "vencido", reference: "2024/01" },
];

// Format CPF for display
function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function SecretaryDashboard() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [boletos] = useState<Boleto[]>(MOCK_BOLETOS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    cpf: "",
    phone: "",
    grade: "",
  });

  // Credentials dialog state
  const [showCredentials, setShowCredentials] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ cpf: string; password: string; name: string } | null>(null);
  const [copied, setCopied] = useState<"cpf" | "password" | null>(null);

  // Reset password dialog
  const [resetPasswordStudentId, setResetPasswordStudentId] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Fetch students from database
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } else {
      setStudents(data || []);
    }
    setIsLoading(false);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  const filteredBoletos = boletos.filter((boleto) =>
    boleto.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.cpf || !newStudent.grade) {
      toast({
        title: "Erro",
        description: "Preencha nome, CPF e série.",
        variant: "destructive",
      });
      return;
    }

    // Validate CPF format (11 digits)
    const cleanCpf = newStudent.cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "O CPF deve conter 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("create-student", {
        body: {
          name: newStudent.name,
          cpf: cleanCpf,
          phone: newStudent.phone || null,
          grade: newStudent.grade,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao criar aluno");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar aluno");
      }

      // Show credentials dialog
      setNewCredentials({
        cpf: formatCpf(result.credentials.cpf),
        password: result.credentials.password,
        name: result.student.name,
      });
      setShowCredentials(true);

      // Refresh list
      await fetchStudents();

      // Reset form
      setNewStudent({ name: "", cpf: "", phone: "", grade: "" });
      setIsAddStudentOpen(false);

      toast({
        title: "Aluno cadastrado!",
        description: "Copie a senha gerada para entregar ao aluno.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar aluno";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (studentId: string) => {
    setIsResettingPassword(true);
    setResetPasswordStudentId(studentId);

    try {
      const response = await supabase.functions.invoke("get-student-password", {
        body: { studentId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao resetar senha");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Erro ao resetar senha");
      }

      // Show credentials dialog
      setNewCredentials({
        cpf: formatCpf(result.cpf),
        password: result.password,
        name: result.studentName,
      });
      setShowCredentials(true);

      toast({
        title: "Nova senha gerada!",
        description: "Copie a senha para entregar ao aluno.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao resetar senha";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
      setResetPasswordStudentId(null);
    }
  };

  const copyToClipboard = async (text: string, type: "cpf" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrintBoleto = (boleto: Boleto) => {
    const printContent = `
      ===============================
      BOLETO DE MENSALIDADE
      ===============================
      Aluno: ${boleto.studentName}
      Referência: ${boleto.reference}
      Valor: R$ ${boleto.value.toFixed(2)}
      Vencimento: ${new Date(boleto.dueDate).toLocaleDateString("pt-BR")}
      Status: ${boleto.status.toUpperCase()}
      ===============================
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Boleto - ${boleto.studentName}</title>
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
      description: `Boleto de ${boleto.studentName} enviado para impressão.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ativo: "default",
      inativo: "secondary",
      pago: "default",
      pendente: "outline",
      vencido: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Secretaria</h2>
        <p className="text-muted-foreground">Gerencie alunos e boletos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {students.filter((s) => s.status === "ativo").length} ativos
            </p>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {boletos.filter((b) => b.status === "pago").reduce((acc, b) => acc + b.value, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">boletos pagos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="boletos" className="gap-2">
              <FileText className="h-4 w-4" />
              Boletos
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[200px] md:w-[250px]"
              />
            </div>

            <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Aluno
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do aluno. Uma senha será gerada automaticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Nome do aluno"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={newStudent.cpf}
                      onChange={(e) => setNewStudent({ ...newStudent, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      O aluno usará o CPF para fazer login
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Série/Turma *</Label>
                    <Select
                      value={newStudent.grade}
                      onValueChange={(value) => setNewStudent({ ...newStudent, grade: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a série" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6º Ano">6º Ano</SelectItem>
                        <SelectItem value="7º Ano">7º Ano</SelectItem>
                        <SelectItem value="8º Ano">8º Ano</SelectItem>
                        <SelectItem value="9º Ano">9º Ano</SelectItem>
                        <SelectItem value="1º EM">1º Ensino Médio</SelectItem>
                        <SelectItem value="2º EM">2º Ensino Médio</SelectItem>
                        <SelectItem value="3º EM">3º Ensino Médio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddStudent} className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Cadastrar Aluno
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Alunos</CardTitle>
              <CardDescription>Gerencie os alunos cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{formatCpf(student.cpf)}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>{new Date(student.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleResetPassword(student.id)}
                            disabled={isResettingPassword && resetPasswordStudentId === student.id}
                          >
                            {isResettingPassword && resetPasswordStudentId === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Key className="h-4 w-4" />
                            )}
                            Verificar Senha
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum aluno encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boletos Tab */}
        <TabsContent value="boletos">
          <Card>
            <CardHeader>
              <CardTitle>Boletos</CardTitle>
              <CardDescription>Visualize e imprima boletos de mensalidade</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBoletos.map((boleto) => (
                    <TableRow key={boleto.id}>
                      <TableCell className="font-medium">{boleto.studentName}</TableCell>
                      <TableCell>{boleto.reference}</TableCell>
                      <TableCell>R$ {boleto.value.toFixed(2)}</TableCell>
                      <TableCell>{new Date(boleto.dueDate).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{getStatusBadge(boleto.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handlePrintBoleto(boleto)}
                        >
                          <Printer className="h-4 w-4" />
                          Imprimir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBoletos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum boleto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Credenciais do Aluno
            </DialogTitle>
            <DialogDescription>
              Copie e entregue estas credenciais ao aluno: <strong>{newCredentials?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>CPF (Login)</Label>
              <div className="flex gap-2">
                <Input value={newCredentials?.cpf || ""} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => newCredentials && copyToClipboard(newCredentials.cpf.replace(/\D/g, ""), "cpf")}
                >
                  {copied === "cpf" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="flex gap-2">
                <Input value={newCredentials?.password || ""} readOnly className="font-mono text-lg tracking-wider" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => newCredentials && copyToClipboard(newCredentials.password, "password")}
                >
                  {copied === "password" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                ⚠️ <strong>Importante:</strong> Anote a senha antes de fechar esta janela. 
                O aluno usará o CPF e esta senha para entrar no sistema.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
