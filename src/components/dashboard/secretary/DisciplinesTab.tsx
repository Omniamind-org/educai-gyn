import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, BookOpen, Trash2, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Discipline {
  id: string;
  name: string;
  created_at: string;
  teacher_count?: number;
}

interface Teacher {
  id: string;
  name: string;
}

export function DisciplinesTab() {
  const { toast } = useToast();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add discipline dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDisciplineName, setNewDisciplineName] = useState("");
  
  // Manage teachers dialog
  const [isManageTeachersOpen, setIsManageTeachersOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [disciplineTeachers, setDisciplineTeachers] = useState<string[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isSavingTeachers, setIsSavingTeachers] = useState(false);

  useEffect(() => {
    fetchDisciplines();
    fetchTeachers();
  }, []);

  const fetchDisciplines = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("disciplines")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as disciplinas.",
        variant: "destructive",
      });
    } else {
      // Fetch teacher counts for each discipline
      const disciplinesWithCounts = await Promise.all(
        (data || []).map(async (disc) => {
          const { count } = await supabase
            .from("teacher_disciplines")
            .select("id", { count: "exact" })
            .eq("discipline_id", disc.id);
          return {
            ...disc,
            teacher_count: count || 0,
          };
        })
      );
      setDisciplines(disciplinesWithCounts);
    }
    setIsLoading(false);
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("id, name")
      .eq("status", "ativo")
      .order("name", { ascending: true });

    if (!error) {
      setTeachers(data || []);
    }
  };

  const fetchDisciplineTeachers = async (disciplineId: string) => {
    setIsLoadingTeachers(true);
    const { data } = await supabase
      .from("teacher_disciplines")
      .select("teacher_id")
      .eq("discipline_id", disciplineId);

    setDisciplineTeachers((data || []).map((t) => t.teacher_id));
    setIsLoadingTeachers(false);
  };

  const handleAddDiscipline = async () => {
    if (!newDisciplineName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome da disciplina.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("disciplines").insert({
      name: newDisciplineName.trim(),
    });

    if (error) {
      toast({
        title: "Erro",
        description: error.code === "23505" 
          ? "Já existe uma disciplina com este nome."
          : "Não foi possível criar a disciplina.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Disciplina criada com sucesso!",
      });
      setNewDisciplineName("");
      setIsAddOpen(false);
      fetchDisciplines();
    }
    setIsSubmitting(false);
  };

  const handleDeleteDiscipline = async (disciplineId: string) => {
    const { error } = await supabase
      .from("disciplines")
      .delete()
      .eq("id", disciplineId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a disciplina.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Disciplina excluída com sucesso!",
      });
      fetchDisciplines();
    }
  };

  const handleManageTeachers = (discipline: Discipline) => {
    setSelectedDiscipline(discipline);
    fetchDisciplineTeachers(discipline.id);
    setIsManageTeachersOpen(true);
  };

  const toggleTeacher = (teacherId: string) => {
    setDisciplineTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSaveTeachers = async () => {
    if (!selectedDiscipline) return;

    setIsSavingTeachers(true);
    try {
      // Delete all existing assignments
      await supabase
        .from("teacher_disciplines")
        .delete()
        .eq("discipline_id", selectedDiscipline.id);

      // Insert new assignments
      if (disciplineTeachers.length > 0) {
        const inserts = disciplineTeachers.map((teacherId) => ({
          discipline_id: selectedDiscipline.id,
          teacher_id: teacherId,
        }));
        await supabase.from("teacher_disciplines").insert(inserts);
      }

      toast({
        title: "Sucesso",
        description: "Professores atualizados com sucesso!",
      });
      setIsManageTeachersOpen(false);
      fetchDisciplines();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os professores.",
        variant: "destructive",
      });
    } finally {
      setIsSavingTeachers(false);
    }
  };

  const filteredDisciplines = disciplines.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar disciplina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[250px]"
          />
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Disciplina
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Disciplina</DialogTitle>
              <DialogDescription>
                Adicione uma nova disciplina ao sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="discipline-name">Nome da Disciplina *</Label>
                <Input
                  id="discipline-name"
                  value={newDisciplineName}
                  onChange={(e) => setNewDisciplineName(e.target.value)}
                  placeholder="Ex: Matemática, Português, História..."
                  disabled={isSubmitting}
                />
              </div>
              <Button onClick={handleAddDiscipline} className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Cadastrar Disciplina
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Disciplines Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Disciplinas Cadastradas
          </CardTitle>
          <CardDescription>
            Gerencie as disciplinas e seus professores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDisciplines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma disciplina cadastrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Professores</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisciplines.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell className="font-medium">{discipline.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {discipline.teacher_count} professor{discipline.teacher_count !== 1 ? "es" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageTeachers(discipline)}
                          className="gap-1"
                        >
                          <Users className="h-4 w-4" />
                          Professores
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDiscipline(discipline.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manage Teachers Dialog */}
      <Dialog open={isManageTeachersOpen} onOpenChange={setIsManageTeachersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Professores de {selectedDiscipline?.name}</DialogTitle>
            <DialogDescription>
              Selecione os professores que lecionam esta disciplina.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingTeachers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : teachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum professor cadastrado.
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50"
                  >
                    <Checkbox
                      id={`teacher-${teacher.id}`}
                      checked={disciplineTeachers.includes(teacher.id)}
                      onCheckedChange={() => toggleTeacher(teacher.id)}
                    />
                    <Label
                      htmlFor={`teacher-${teacher.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {teacher.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={handleSaveTeachers}
              className="w-full mt-4"
              disabled={isSavingTeachers}
            >
              {isSavingTeachers ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
