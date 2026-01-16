import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Loader2, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isValidCPF } from "@/utils/cpfValidation";
import { Badge } from "@/components/ui/badge";

interface Teacher {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  subject: string | null;
  status: string;
  created_at: string;
}

interface Discipline {
  id: string;
  name: string;
}

interface TeachersViewProps {
  onCredentialsCreated: (credentials: any) => void;
}

export function TeachersView({ onCredentialsCreated }: TeachersViewProps) {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [teacherDisciplinesMap, setTeacherDisciplinesMap] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    cpf: "",
    phone: "",
    discipline_ids: [] as string[],
  });

  useEffect(() => {
    fetchTeachers();
    fetchDisciplines();
  }, []);

  const fetchDisciplines = async () => {
    const { data } = await supabase
      .from("disciplines")
      .select("id, name")
      .order("name");
    setDisciplines(data || []);
  };

  const fetchTeachers = async () => {
    setIsLoading(true);
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
      if (data && data.length > 0) {
        fetchTeacherDisciplines(data.map(t => t.id));
      }
    }
    setIsLoading(false);
  };

  const fetchTeacherDisciplines = async (teacherIds: string[]) => {
    if (teacherIds.length === 0) return;

    const { data } = await supabase
      .from("teacher_disciplines")
      .select("teacher_id, discipline_id, disciplines(name)")
      .in("teacher_id", teacherIds);

    const map: Record<string, string[]> = {};
    (data || []).forEach((td: any) => {
      if (!map[td.teacher_id]) {
        map[td.teacher_id] = [];
      }
      if (td.disciplines?.name) {
        map[td.teacher_id].push(td.disciplines.name);
      }
    });
    setTeacherDisciplinesMap(map);
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

    if (!isValidCPF(newTeacher.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, insira um CPF válido.",
        variant: "destructive",
      });
      return;
    }
    const cleanCpf = newTeacher.cpf.replace(/\D/g, "");

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke("create-teacher", {
        body: {
          name: newTeacher.name,
          cpf: cleanCpf,
          phone: newTeacher.phone || null,
          discipline_ids: newTeacher.discipline_ids,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao criar professor");
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar professor");
      }

      onCredentialsCreated({
        cpf: result.credentials.cpf,
        password: result.credentials.password,
        name: result.teacher.name,
        type: "professor",
      });

      await fetchTeachers();
      setNewTeacher({ name: "", cpf: "", phone: "", discipline_ids: [] });
      setIsAddTeacherOpen(false);

      toast({
        title: "Professor cadastrado!",
        description: "Credenciais geradas com sucesso.",
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

  const toggleDisciplineSelection = (disciplineId: string) => {
    setNewTeacher(prev => ({
      ...prev,
      discipline_ids: prev.discipline_ids.includes(disciplineId)
        ? prev.discipline_ids.filter(id => id !== disciplineId)
        : [...prev.discipline_ids, disciplineId]
    }));
  };

  const handleResetPassword = async (teacherId: string) => {
    try {
      const response = await supabase.functions.invoke("get-teacher-password", {
        body: { teacherId },
      });

      if (response.error) throw new Error(response.error.message);
      const result = response.data;
      if (!result.success) throw new Error(result.error);

      onCredentialsCreated({
        cpf: result.cpf,
        password: result.password,
        name: result.teacherName,
        type: "professor",
      });

      toast({
        title: "Senha recuperada!",
        description: "As credenciais foram exibidas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível recuperar a senha.",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.cpf.includes(searchTerm.replace(/\D/g, ""))
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
            placeholder="Buscar professor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[200px] md:w-[250px]"
          />
        </div>

        <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Professor</DialogTitle>
              <DialogDescription>
                Preencha os dados do professor e selecione as disciplinas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="t-name">Nome Completo *</Label>
                <Input
                  id="t-name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="Nome do professor"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-cpf">CPF *</Label>
                <Input
                  id="t-cpf"
                  value={newTeacher.cpf}
                  onChange={(e) => setNewTeacher({ ...newTeacher, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-phone">Telefone (opcional)</Label>
                <Input
                  id="t-phone"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Disciplinas</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-[150px] overflow-y-auto">
                  {disciplines.length === 0 ? (
                    <span className="text-sm text-muted-foreground col-span-2 text-center">Nenhuma disciplina cadastrada</span>
                  ) : (
                    disciplines.map((d) => (
                      <div key={d.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`disc-${d.id}`} 
                          checked={newTeacher.discipline_ids.includes(d.id)}
                          onCheckedChange={() => toggleDisciplineSelection(d.id)}
                        />
                        <Label htmlFor={`disc-${d.id}`} className="text-sm cursor-pointer">{d.name}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleAddTeacher} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar Professor"
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
              <TableHead>Disciplinas</TableHead>
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
            ) : filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum professor encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.cpf}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacherDisciplinesMap[teacher.id]?.map((d) => (
                        <Badge key={d} variant="outline" className="text-xs">
                          {d}
                        </Badge>
                      )) || <span className="text-muted-foreground text-xs">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResetPassword(teacher.id)}
                      title="Recuperar Senha"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
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
