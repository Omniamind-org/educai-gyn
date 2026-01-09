import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Printer, Users, FileText, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  cpf: string;
  grade: string;
  status: "ativo" | "inativo";
  createdAt: string;
}

interface Boleto {
  id: string;
  studentName: string;
  value: number;
  dueDate: string;
  status: "pendente" | "pago" | "vencido";
  reference: string;
}

// Mock data
const MOCK_STUDENTS: Student[] = [
  { id: "1", name: "João Silva", email: "joao@email.com", cpf: "123.456.789-00", grade: "9º Ano", status: "ativo", createdAt: "2024-01-15" },
  { id: "2", name: "Maria Santos", email: "maria@email.com", cpf: "987.654.321-00", grade: "8º Ano", status: "ativo", createdAt: "2024-02-20" },
  { id: "3", name: "Pedro Oliveira", email: "pedro@email.com", cpf: "456.789.123-00", grade: "7º Ano", status: "inativo", createdAt: "2023-11-10" },
];

const MOCK_BOLETOS: Boleto[] = [
  { id: "1", studentName: "João Silva", value: 450.00, dueDate: "2024-02-10", status: "pago", reference: "2024/02" },
  { id: "2", studentName: "Maria Santos", value: 450.00, dueDate: "2024-02-10", status: "pendente", reference: "2024/02" },
  { id: "3", studentName: "João Silva", value: 450.00, dueDate: "2024-03-10", status: "pendente", reference: "2024/03" },
  { id: "4", studentName: "Pedro Oliveira", value: 450.00, dueDate: "2024-01-10", status: "vencido", reference: "2024/01" },
];

export function SecretaryDashboard() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [boletos] = useState<Boleto[]>(MOCK_BOLETOS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    cpf: "",
    grade: "",
  });

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm)
  );

  const filteredBoletos = boletos.filter((boleto) =>
    boleto.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.cpf || !newStudent.grade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const student: Student = {
      id: Date.now().toString(),
      ...newStudent,
      status: "ativo",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setStudents([...students, student]);
    setNewStudent({ name: "", email: "", cpf: "", grade: "" });
    setIsAddStudentOpen(false);
    toast({
      title: "Sucesso",
      description: "Aluno cadastrado com sucesso!",
    });
  };

  const handlePrintBoleto = (boleto: Boleto) => {
    // Simulate print
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
        <div className="flex items-center justify-between">
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

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[250px]"
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
                    Preencha os dados do aluno para cadastrá-lo no sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Nome do aluno"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={newStudent.cpf}
                      onChange={(e) => setNewStudent({ ...newStudent, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Série/Turma</Label>
                    <Select
                      value={newStudent.grade}
                      onValueChange={(value) => setNewStudent({ ...newStudent, grade: value })}
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
                  <Button onClick={handleAddStudent} className="w-full gap-2">
                    <UserPlus className="h-4 w-4" />
                    Cadastrar Aluno
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Série</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.cpf}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>{new Date(student.createdAt).toLocaleDateString("pt-BR")}</TableCell>
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
    </div>
  );
}
