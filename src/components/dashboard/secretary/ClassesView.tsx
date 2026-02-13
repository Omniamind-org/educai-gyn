import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Loader2, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Class {
  id: string;
  name: string;
  grade: string;
  year: number;
  created_at: string;
  student_count?: number;
  teacher_count?: number;
}

export function ClassesView() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newClass, setNewClass] = useState({
    name: "",
    grade: "",
  });

  // Manage Class State
  const [isManageClassOpen, setIsManageClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<string[]>([]);
  const [classTeachers, setClassTeachers] = useState<string[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSavingMembers, setIsSavingMembers] = useState(false);

  // Lists for selection
  const [allStudents, setAllStudents] = useState<{ id: string, name: string }[]>([]);
  const [allTeachers, setAllTeachers] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    fetchClasses();
    fetchSelectionLists();
  }, []);

  const fetchSelectionLists = async () => {
    const [studentsRes, teachersRes] = await Promise.all([
      supabase.from("students").select("id, name").in("status", ["ativo", "active"]),
      supabase.from("teachers").select("id, name").in("status", ["ativo", "active"])
    ]);
    setAllStudents(studentsRes.data || []);
    setAllTeachers(teachersRes.data || []);
  };

  const fetchClasses = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
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

  const fetchClassMembers = async (classId: string) => {
    setIsLoadingMembers(true);
    const [studentsRes, teachersRes] = await Promise.all([
      supabase.from("class_students").select("student_id").eq("class_id", classId),
      supabase.from("class_teachers").select("teacher_id").eq("class_id", classId),
    ]);

    setClassStudents((studentsRes.data || []).map((s) => s.student_id));
    setClassTeachers((teachersRes.data || []).map((t) => t.teacher_id));
    setIsLoadingMembers(false);
  };

  const handleSaveClassMembers = async () => {
    if (!selectedClass) return;

    setIsSavingMembers(true);

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
      setIsSavingMembers(false);
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

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[200px] md:w-[250px]"
          />
        </div>

        <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Turma</DialogTitle>
              <DialogDescription>
                Defina o nome e a série da turma para o ano letivo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="c-name">Nome da Turma *</Label>
                <Input
                  id="c-name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="Ex: Turma A"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-grade">Série/Ano *</Label>
                <Input
                  id="c-grade"
                  value={newClass.grade}
                  onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                  placeholder="Ex: 1º Ano Ensino Médio"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleAddClass}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Turma"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Class Dialog */}
        <Dialog open={isManageClassOpen} onOpenChange={setIsManageClassOpen}>
          <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Turma: {selectedClass?.name}</DialogTitle>
              <DialogDescription>Add or remove students and teachers.</DialogDescription>
            </DialogHeader>

            {isLoadingMembers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Tabs defaultValue="students" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="students">Alunos ({classStudents.length})</TabsTrigger>
                  <TabsTrigger value="teachers">Professores ({classTeachers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-4 pt-4">
                  <ScrollArea className="h-[300px] border rounded-md p-4">
                    {allStudents.length === 0 ? (
                      <p className="text-center text-muted-foreground">Nenhum aluno ativo disponível.</p>
                    ) : (
                      allStudents.map(student => (
                        <div key={student.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`st-${student.id}`}
                            checked={classStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <Label htmlFor={`st-${student.id}`} className="cursor-pointer flex-1">
                            {student.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="teachers" className="space-y-4 pt-4">
                  <ScrollArea className="h-[300px] border rounded-md p-4">
                    {allTeachers.length === 0 ? (
                      <p className="text-center text-muted-foreground">Nenhum professor ativo disponível.</p>
                    ) : (
                      allTeachers.map(teacher => (
                        <div key={teacher.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`tc-${teacher.id}`}
                            checked={classTeachers.includes(teacher.id)}
                            onCheckedChange={() => toggleTeacher(teacher.id)}
                          />
                          <Label htmlFor={`tc-${teacher.id}`} className="cursor-pointer flex-1">
                            {teacher.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveClassMembers} disabled={isSavingMembers}>
                    {isSavingMembers ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </div>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Alunos</TableHead>
              <TableHead>Professores</TableHead>
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
            ) : filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma turma encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.grade}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{cls.student_count || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{cls.teacher_count || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManageClass(cls)}
                    >
                      <Settings className="h-4 w-4" />
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
