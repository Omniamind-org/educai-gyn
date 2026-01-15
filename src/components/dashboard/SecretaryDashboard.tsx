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
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Printer, Users, FileText, Search, Plus, Copy, Key, CheckCircle, Loader2, GraduationCap, BookOpen, Settings } from "lucide-react";
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

interface Teacher {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  subject: string | null;
  status: string;
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  year: number;
  created_at: string;
  student_count?: number;
  teacher_count?: number;
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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [boletos] = useState<Boleto[]>(MOCK_BOLETOS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isManageClassOpen, setIsManageClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    cpf: "",
    phone: "",
    grade: "",
  });
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    cpf: "",
    phone: "",
    subject: "",
  });
  const [newClass, setNewClass] = useState({
    name: "",
    grade: "",
  });

  // For managing class members
  const [classStudents, setClassStudents] = useState<string[]>([]);
  const [classTeachers, setClassTeachers] = useState<string[]>([]);
  const [isLoadingClassMembers, setIsLoadingClassMembers] = useState(false);
  const [isSavingClassMembers, setIsSavingClassMembers] = useState(false);

  // Credentials dialog state
  const [showCredentials, setShowCredentials] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ cpf: string; password: string; name: string; type: "aluno" | "professor" } | null>(null);
  const [copied, setCopied] = useState<"cpf" | "password" | null>(null);

  // Reset password dialog
  const [resetPasswordStudentId, setResetPasswordStudentId] = useState<string | null>(null);
  const [resetPasswordTeacherId, setResetPasswordTeacherId] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Fetch students, teachers, and classes from database
  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchClasses();
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

  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os professores.",
        variant: "destructive",
      });
    } else {
      setTeachers(data || []);
    }
    setIsLoadingTeachers(false);
  };

  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    } else {
      // Fetch student and teacher counts for each class
      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const [studentsRes, teachersRes] = await Promise.all([
            supabase.from("class_students").select("id", { count: "exact" }).eq("class_id", cls.id),
            supabase.from("class_teachers").select("id", { count: "exact" }).eq("class_id", cls.id),
          ]);
          return {
            ...cls,
            student_count: studentsRes.count || 0,
            teacher_count: teachersRes.count || 0,
          };
        })
      );
      setClasses(classesWithCounts);
    }
    setIsLoadingClasses(false);
  };

  const fetchClassMembers = async (classId: string) => {
    setIsLoadingClassMembers(true);
    const [studentsRes, teachersRes] = await Promise.all([
      supabase.from("class_students").select("student_id").eq("class_id", classId),
      supabase.from("class_teachers").select("teacher_id").eq("class_id", classId),
    ]);

    setClassStudents((studentsRes.data || []).map((s) => s.student_id));
    setClassTeachers((teachersRes.data || []).map((t) => t.teacher_id));
    setIsLoadingClassMembers(false);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.grade.toLowerCase().includes(searchTerm.toLowerCase())
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
        type: "aluno",
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

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.cpf) {
      toast({
        title: "Erro",
        description: "Preencha nome e CPF.",
        variant: "destructive",
      });
      return;
    }

    // Validate CPF format (11 digits)
    const cleanCpf = newTeacher.cpf.replace(/\D/g, "");
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
      const response = await supabase.functions.invoke("create-teacher", {
        body: {
          name: newTeacher.name,
          cpf: cleanCpf,
          phone: newTeacher.phone || null,
          subject: newTeacher.subject || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao criar professor");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar professor");
      }

      // Show credentials dialog
      setNewCredentials({
        cpf: formatCpf(result.credentials.cpf),
        password: result.credentials.password,
        name: result.teacher.name,
        type: "professor",
      });
      setShowCredentials(true);

      // Refresh list
      await fetchTeachers();

      // Reset form
      setNewTeacher({ name: "", cpf: "", phone: "", subject: "" });
      setIsAddTeacherOpen(false);

      toast({
        title: "Professor cadastrado!",
        description: "Copie a senha gerada para entregar ao professor.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar professor";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.grade) {
      toast({
        title: "Erro",
        description: "Preencha nome e série da turma.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("classes")
        .insert({
          name: newClass.name,
          grade: newClass.grade,
          year: new Date().getFullYear(),
        });

      if (error) throw error;

      await fetchClasses();
      setNewClass({ name: "", grade: "" });
      setIsAddClassOpen(false);

      toast({
        title: "Turma criada!",
        description: "Agora você pode adicionar alunos e professores.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar turma";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageClass = (cls: Class) => {
    setSelectedClass(cls);
    fetchClassMembers(cls.id);
    setIsManageClassOpen(true);
  };

  const handleSaveClassMembers = async () => {
    if (!selectedClass) return;

    setIsSavingClassMembers(true);

    try {
      // Delete existing associations
      await Promise.all([
        supabase.from("class_students").delete().eq("class_id", selectedClass.id),
        supabase.from("class_teachers").delete().eq("class_id", selectedClass.id),
      ]);

      // Insert new associations
      const studentInserts = classStudents.map((studentId) => ({
        class_id: selectedClass.id,
        student_id: studentId,
      }));

      const teacherInserts = classTeachers.map((teacherId) => ({
        class_id: selectedClass.id,
        teacher_id: teacherId,
      }));

      if (studentInserts.length > 0) {
        await supabase.from("class_students").insert(studentInserts);
      }

      if (teacherInserts.length > 0) {
        await supabase.from("class_teachers").insert(teacherInserts);
      }

      await fetchClasses();
      setIsManageClassOpen(false);

      toast({
        title: "Turma atualizada!",
        description: "Alunos e professores foram atualizados.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSavingClassMembers(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setClassStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleTeacher = (teacherId: string) => {
    setClassTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleResetStudentPassword = async (studentId: string) => {
    setIsResettingPassword(true);
    setResetPasswordStudentId(studentId);

    try {
      const response = await supabase.functions.invoke("get-student-password", {
        body: { studentId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao verificar senha");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Erro ao verificar senha");
      }

      // Show credentials dialog
      setNewCredentials({
        cpf: formatCpf(result.cpf),
        password: result.password,
        name: result.studentName,
        type: "aluno",
      });
      setShowCredentials(true);

      toast({
        title: "Senha encontrada!",
        description: "Copie a senha para entregar ao aluno.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao verificar senha";
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

  const handleResetTeacherPassword = async (teacherId: string) => {
    setIsResettingPassword(true);
    setResetPasswordTeacherId(teacherId);

    try {
      const response = await supabase.functions.invoke("get-teacher-password", {
        body: { teacherId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao verificar senha");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Erro ao verificar senha");
      }

      // Show credentials dialog
      setNewCredentials({
        cpf: formatCpf(result.cpf),
        password: result.password,
        name: result.teacherName,
        type: "professor",
      });
      setShowCredentials(true);

      toast({
        title: "Senha encontrada!",
        description: "Copie a senha para entregar ao professor.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao verificar senha";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
      setResetPasswordTeacherId(null);
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
        <p className="text-muted-foreground">Gerencie alunos, professores, turmas e boletos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium">Total Professores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teachers.filter((t) => t.status === "ativo").length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Turmas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">
              ano {new Date().getFullYear()}
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="teachers" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Professores
            </TabsTrigger>
            <TabsTrigger value="classes" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Turmas
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

            {/* Add Student Dialog */}
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
                    <Label htmlFor="grade">Série *</Label>
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

            {/* Add Teacher Dialog */}
            <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Professor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Professor</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do professor. Uma senha será gerada automaticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-name">Nome Completo *</Label>
                    <Input
                      id="teacher-name"
                      value={newTeacher.name}
                      onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                      placeholder="Nome do professor"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-cpf">CPF *</Label>
                    <Input
                      id="teacher-cpf"
                      value={newTeacher.cpf}
                      onChange={(e) => setNewTeacher({ ...newTeacher, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      O professor usará o CPF para fazer login
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-phone">Telefone (opcional)</Label>
                    <Input
                      id="teacher-phone"
                      value={newTeacher.phone}
                      onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-subject">Disciplina (opcional)</Label>
                    <Input
                      id="teacher-subject"
                      value={newTeacher.subject}
                      onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                      placeholder="Ex: Matemática, Português..."
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button onClick={handleAddTeacher} className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Cadastrar Professor
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Class Dialog */}
            <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Turma
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Turma</DialogTitle>
                  <DialogDescription>
                    Crie uma turma e depois adicione alunos e professores.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-name">Nome da Turma *</Label>
                    <Input
                      id="class-name"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      placeholder="Ex: Turma A, Turma B..."
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class-grade">Série *</Label>
                    <Select
                      value={newClass.grade}
                      onValueChange={(value) => setNewClass({ ...newClass, grade: value })}
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
                  <Button onClick={handleAddClass} className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Criar Turma
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
                            onClick={() => handleResetStudentPassword(student.id)}
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

        {/* Teachers Tab */}
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Professores</CardTitle>
              <CardDescription>Gerencie os professores cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTeachers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{formatCpf(teacher.cpf)}</TableCell>
                        <TableCell>{teacher.subject || "-"}</TableCell>
                        <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                        <TableCell>{new Date(teacher.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleResetTeacherPassword(teacher.id)}
                            disabled={isResettingPassword && resetPasswordTeacherId === teacher.id}
                          >
                            {isResettingPassword && resetPasswordTeacherId === teacher.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Key className="h-4 w-4" />
                            )}
                            Verificar Senha
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum professor encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Turmas</CardTitle>
              <CardDescription>Gerencie as turmas e seus membros</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingClasses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Alunos</TableHead>
                      <TableHead>Professores</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.grade}</TableCell>
                        <TableCell>{cls.year}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cls.student_count} alunos</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{cls.teacher_count} professores</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleManageClass(cls)}
                          >
                            <Settings className="h-4 w-4" />
                            Gerenciar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredClasses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhuma turma encontrada
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

      {/* Manage Class Dialog */}
      <Dialog open={isManageClassOpen} onOpenChange={setIsManageClassOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Turma: {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Selecione os alunos e professores desta turma ({selectedClass?.grade})
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingClassMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Teachers Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Professores
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`teacher-${teacher.id}`}
                        checked={classTeachers.includes(teacher.id)}
                        onCheckedChange={() => toggleTeacher(teacher.id)}
                      />
                      <label
                        htmlFor={`teacher-${teacher.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {teacher.name}
                        {teacher.subject && (
                          <span className="text-muted-foreground ml-1">({teacher.subject})</span>
                        )}
                      </label>
                    </div>
                  ))}
                  {teachers.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-2">
                      Nenhum professor cadastrado
                    </p>
                  )}
                </div>
              </div>

              {/* Students Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Alunos
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={classStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {student.name}
                        <span className="text-muted-foreground ml-1">({student.grade})</span>
                      </label>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-2">
                      Nenhum aluno cadastrado
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {classStudents.length} aluno(s) e {classTeachers.length} professor(es) selecionado(s)
                </div>
                <Button onClick={handleSaveClassMembers} disabled={isSavingClassMembers} className="gap-2">
                  {isSavingClassMembers ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Credenciais do {newCredentials?.type === "professor" ? "Professor" : "Aluno"}
            </DialogTitle>
            <DialogDescription>
              Copie e entregue estas credenciais: <strong>{newCredentials?.name}</strong>
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
                  onClick={() => copyToClipboard(newCredentials?.cpf || "", "cpf")}
                >
                  {copied === "cpf" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="flex gap-2">
                <Input value={newCredentials?.password || ""} readOnly className="font-mono text-lg" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(newCredentials?.password || "", "password")}
                >
                  {copied === "password" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p>
                <strong>Importante:</strong> Anote ou copie a senha agora. O{" "}
                {newCredentials?.type === "professor" ? "professor" : "aluno"} usará o CPF e esta
                senha para acessar o sistema.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
