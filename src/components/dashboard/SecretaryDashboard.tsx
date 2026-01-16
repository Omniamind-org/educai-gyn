import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, BookOpen, Bookmark, FileText, CheckCircle, Copy } from "lucide-react";
import { DisciplinesTab } from "./secretary/DisciplinesTab";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { StudentsView } from "./secretary/StudentsView";
import { TeachersView } from "./secretary/TeachersView";
import { ClassesView } from "./secretary/ClassesView";
import { BoletosView } from "./secretary/BoletosView";
import { useToast } from "@/hooks/use-toast";

// Format CPF for display
function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function SecretaryDashboard() {
  const { toast } = useToast();
  
  // Stats State
  const [stats, setStats] = useState({
    students: { total: 0, active: 0 },
    teachers: { total: 0, active: 0 },
    classes: 0,
    boletos: { pending: 0, overdue: 0 }
  });

  // Credentials Dialog State
  const [showCredentials, setShowCredentials] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ cpf: string; password: string; name: string; type: "aluno" | "professor" } | null>(null);
  const [copied, setCopied] = useState<"cpf" | "password" | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [studentsRes, teachersRes, classesRes, boletosRes] = await Promise.all([
      supabase.from("students").select("status"),
      supabase.from("teachers").select("status"),
      supabase.from("classes").select("id", { count: "exact", head: true }),
      supabase.from("boletos").select("status, due_date")
    ]);

    const today = new Date();
    const boletos = boletosRes.data || [];
    const pending = boletos.filter(b => b.status === "pendente" && new Date(b.due_date) >= today).length;
    const overdue = boletos.filter(b => b.status === "vencido" || (b.status === "pendente" && new Date(b.due_date) < today)).length;

    setStats({
      students: {
        total: studentsRes.data?.length || 0,
        active: studentsRes.data?.filter(s => s.status === "ativo").length || 0
      },
      teachers: {
        total: teachersRes.data?.length || 0,
        active: teachersRes.data?.filter(t => t.status === "ativo").length || 0
      },
      classes: classesRes.count || 0,
      boletos: { pending, overdue }
    });
  };

  const handleCredentialsCreated = (creds: any) => {
    setNewCredentials({
      cpf: formatCpf(creds.cpf),
      password: creds.password,
      name: creds.name,
      type: creds.type
    });
    setShowCredentials(true);
    fetchStats(); // Refresh stats when new entity is added
  };

  const copyToClipboard = async (text: string, type: "cpf" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copiado!",
      description: `${type === "cpf" ? "CPF" : "Senha"} copiado para a área de transferência.`
    });
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
            <div className="text-2xl font-bold">{stats.students.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.students.active} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Professores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.teachers.active} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Turmas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classes}</div>
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
            <div className="text-2xl font-bold">{stats.boletos.pending}</div>
            <p className="text-xs text-muted-foreground">aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Boletos Vencidos</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.boletos.overdue}</div>
            <p className="text-xs text-muted-foreground">necessitam atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <div className="overflow-x-auto pb-2">
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
            <TabsTrigger value="disciplines" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Disciplinas
            </TabsTrigger>
            <TabsTrigger value="boletos" className="gap-2">
              <FileText className="h-4 w-4" />
              Boletos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="students" className="space-y-4">
          <StudentsView onCredentialsCreated={handleCredentialsCreated} />
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <TeachersView onCredentialsCreated={handleCredentialsCreated} />
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <ClassesView />
        </TabsContent>

        <TabsContent value="disciplines" className="space-y-4">
          <DisciplinesTab />
        </TabsContent>

        <TabsContent value="boletos" className="space-y-4">
          <BoletosView />
        </TabsContent>
      </Tabs>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credenciais Geradas</DialogTitle>
            <DialogDescription>
              Entregue estas credenciais ao {newCredentials?.type}: <strong>{newCredentials?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                CPF (Login)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={newCredentials?.cpf || ""}
                  className="font-mono bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => newCredentials && copyToClipboard(newCredentials.cpf, "cpf")}
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
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Senha Provisória
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={newCredentials?.password || ""}
                  className="font-mono bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => newCredentials && copyToClipboard(newCredentials.password, "password")}
                >
                  {copied === "password" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Esta senha é temporária e deve ser alterada no primeiro acesso.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
             <Button onClick={() => setShowCredentials(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
