import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, Key, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isValidCPF } from "@/utils/cpfValidation";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  grade: string;
  status: string;
  created_at: string;
}

interface StudentsViewProps {
  onCredentialsCreated: (credentials: any) => void;
}

export function StudentsView({ onCredentialsCreated }: StudentsViewProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    cpf: "",
    phone: "",
    grade: "",
  });

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

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.cpf || !newStudent.grade) {
      toast({
        title: "Erro",
        description: "Preencha nome, CPF e série.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidCPF(newStudent.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, insira um CPF válido.",
        variant: "destructive",
      });
      return;
    }
    const cleanCpf = newStudent.cpf.replace(/\D/g, "");

    setIsSubmitting(true);

    try {
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

      onCredentialsCreated({
        cpf: result.credentials.cpf,
        password: result.credentials.password,
        name: result.student.name,
        type: "aluno",
      });

      await fetchStudents();
      setNewStudent({ name: "", cpf: "", phone: "", grade: "" });
      setIsAddStudentOpen(false);

      toast({
        title: "Aluno cadastrado!",
        description: "Credenciais geradas com sucesso.",
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-student-password`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro bruto do fetch:", response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText || "Falha na requisição"}`);
      }

      const result = await response.json();

      onCredentialsCreated({
        cpf: result.cpf,
        password: result.password,
        name: result.studentName,
        type: "aluno",
      });

      toast({
        title: "Senha recuperada!",
        description: "As credenciais foram exibidas.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao recuperar senha";
      console.error("Erro ao recuperar senha:", error);
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ativo: "default",
      inativo: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno..."
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
                <Label htmlFor="grade">Série/Ano *</Label>
                <Select
                  value={newStudent.grade}
                  onValueChange={(value) => setNewStudent({ ...newStudent, grade: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1º Ano do Ensino Médio">1º Ano do Ensino Médio</SelectItem>
                    <SelectItem value="2º Ano do Ensino Médio">2º Ano do Ensino Médio</SelectItem>
                    <SelectItem value="3º Ano do Ensino Médio">3º Ano do Ensino Médio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleAddStudent}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar Aluno"
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
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.cpf}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Select 
                      value={student.status || 'active'} 
                      onValueChange={async (val) => {
                        try {
                          const { error } = await supabase
                            .from('students')
                            .update({ status: val })
                            .eq('id', student.id);
                          
                          if (error) throw error;
                          
                          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: val } : s));
                          
                          toast({ title: "Status Atualizado", description: `Aluno marcado como ${val}.` });
                        } catch (e) {
                          toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" });
                        }
                      }}
                    >
                      <SelectTrigger className={`w-[130px] h-8 text-xs ${
                        student.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                        student.status === 'transferred' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Ativo</div>
                        </SelectItem>
                        <SelectItem value="transferred">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Transferido</div>
                        </SelectItem>
                        <SelectItem value="dropout">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" />Evadido</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPassword(student.id)}
                        title="Recuperar Senha"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={async () => {
                          if (!confirm(`Tem certeza que deseja remover o aluno "${student.name}"? Esta ação não pode ser desfeita.`)) return;

                          try {
                            await supabase.from("class_students").delete().eq("student_id", student.id);
                            const { error } = await supabase.from("students").delete().eq("id", student.id);

                            if (error) throw error;

                            toast({
                              title: "Aluno removido!",
                              description: `${student.name} foi removido do sistema.`,
                            });

                            await fetchStudents();
                          } catch (error) {
                            toast({
                              title: "Erro",
                              description: "Não foi possível remover o aluno.",
                              variant: "destructive",
                            });
                          }
                        }}
                        title="Remover Aluno"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
