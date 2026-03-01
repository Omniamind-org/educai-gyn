import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IntentEventDetail {
  className: string;
  teacherName: string;
}

export function ChangeTeacherAgentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [foundClass, setFoundClass] = useState<{
    id: string;
    name: string;
    grade?: string;
  } | null>(null);
  const [foundTeacher, setFoundTeacher] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [errorContext, setErrorContext] = useState<string | null>(null);
  const [isRedundant, setIsRedundant] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const handleIntent = (e: Event) => {
      const customEvent = e as CustomEvent<IntentEventDetail>;
      setClassName(customEvent.detail.className);
      setTeacherName(customEvent.detail.teacherName);
      setIsOpen(true);
      performValidations(
        customEvent.detail.className,
        customEvent.detail.teacherName,
      );
    };

    window.addEventListener(
      "changeTeacherIntent",
      handleIntent as EventListener,
    );
    return () => {
      window.removeEventListener(
        "changeTeacherIntent",
        handleIntent as EventListener,
      );
    };
  }, []);

  const performValidations = async (clsName: string, tcherName: string) => {
    setLoadingContext(true);
    setErrorContext(null);
    setIsRedundant(false);
    setFoundClass(null);
    setFoundTeacher(null);

    try {
      // 1. Busca inteligente da Turma
      // Como o LLM pode enviar nome e série concatenados (ex: "Turma C 2º Ano..."),
      // e no banco isso fica dividido em 'name' e 'grade', o ilike falha.
      // Buscamos todas e fazemos text matching no client:
      const { data: allClasses, error: classError } = await supabase
        .from("classes")
        .select("id, name, grade")
        .limit(100);

      if (classError || !allClasses || allClasses.length === 0) {
        throw new Error("Erro ao carregar a lista de turmas para validação.");
      }

      const searchTermNormalized = clsName.toLowerCase().trim();
      let classData = allClasses.find((c) =>
        `${c.name} ${c.grade}`.toLowerCase().includes(searchTermNormalized),
      );

      // Matcher fragmentado
      if (!classData) {
        const terms = searchTermNormalized.split(" ");
        const scoredClasses = allClasses.map((c) => {
          let score = 0;
          const fullTitle = `${c.name} ${c.grade}`.toLowerCase();
          terms.forEach((t) => {
            if (t.length > 2 && fullTitle.includes(t)) score++;
          });
          return { ...c, score };
        });
        const highestScore = Math.max(...scoredClasses.map((c) => c.score));
        if (highestScore > 0) {
          classData = scoredClasses.find((c) => c.score === highestScore);
        }
      }

      if (!classData) {
        throw new Error(
          `Turma não encontrada para o termo: "${clsName}". Verifique se está cadastrada.`,
        );
      }

      // 2. Busca o professor
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("id, name")
        .ilike("name", `%${tcherName}%`)
        .in("status", ["ativo", "active", "Ativo", "ACTIVE"])
        .limit(1)
        .single();

      if (teacherError || !teacherData) {
        throw new Error(
          `Professor(a) ativo(a) não encontrado(a) para o termo: "${tcherName}".`,
        );
      }

      setFoundClass({
        id: classData.id,
        name: classData.name,
        grade: classData.grade,
      });
      setFoundTeacher(teacherData);

      // 3. Validação de Redundância
      const { data: pivotData, error: pivotError } = await supabase
        .from("class_teachers")
        .select("id")
        .eq("class_id", classData.id)
        .eq("teacher_id", teacherData.id);

      if (!pivotError && pivotData && pivotData.length > 0) {
        setIsRedundant(true);
        setErrorContext(
          `O(A) professor(a) ${teacherData.name} já está alocado(a) na turma ${classData.name}.`,
        );
      }
    } catch (err: unknown) {
      setErrorContext(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao validar a intenção.",
      );
    } finally {
      setLoadingContext(false);
    }
  };

  const handleConfirm = async () => {
    if (!foundClass || !foundTeacher) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("class_teachers").insert({
        class_id: foundClass.id,
        teacher_id: foundTeacher.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `O professor ${foundTeacher.name} foi associado à turma ${foundClass.name}.`,
      });

      // Pode disparar um evento customizado para recarregar as tabelas da UI, se necessário
      setIsOpen(false);
    } catch (err: unknown) {
      toast({
        title: "Erro ao alocar",
        description: err instanceof Error ? err.message : "Ocorreu um erro.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Alocação de Professor</DialogTitle>
          <DialogDescription>
            A inteligência artificial identificou uma intenção de alteração.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingContext ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Validando dados no sistema...
              </span>
            </div>
          ) : errorContext ? (
            <div className="flex bg-destructive/10 p-4 rounded-md text-destructive">
              <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
              <div className="text-sm">{errorContext}</div>
            </div>
          ) : foundClass && foundTeacher && !isRedundant ? (
            <div className="space-y-4">
              <div className="flex bg-green-500/10 p-4 rounded-md text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-5 w-5 mr-2 shrink-0" />
                <div className="text-sm">
                  Validação concluída com sucesso! Confirma a operação abaixo?
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Turma Destino
                  </div>
                  <div className="font-medium">{foundClass.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Novo Professor
                  </div>
                  <div className="font-medium">{foundTeacher.name}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          {!errorContext && !isRedundant && foundClass && foundTeacher && (
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alocando...
                </>
              ) : (
                "Confirmar Alocação"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
