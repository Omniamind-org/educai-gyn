import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Calendar as CalendarIcon, Save, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
}

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  students: Student[];
}

export function AttendanceDialog({ open, onOpenChange, classId, className, students }: AttendanceDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presentStudents, setPresentStudents] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize all students as present by default when dialog opens
  useEffect(() => {
    if (open) {
      setPresentStudents(new Set(students.map(s => s.id)));
      checkExistingAttendance();
    }
  }, [open, students, date]);

  const checkExistingAttendance = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('daily_attendance')
        .select('present_students')
        .eq('class_id', classId)
        .eq('date', date)
        .maybeSingle();

      if (data && data.present_students) {
        // If attendance exists for this date, load it
        const savedIds = (data.present_students as any[]).map(String);
        setPresentStudents(new Set(savedIds));
      } else {
        // If not, reset to all present (default)
        setPresentStudents(new Set(students.map(s => s.id)));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(presentStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setPresentStudents(newSet);
  };

  const toggleAll = () => {
    if (presentStudents.size === students.length) {
      setPresentStudents(new Set());
    } else {
      setPresentStudents(new Set(students.map(s => s.id)));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const presentArray = Array.from(presentStudents);

      const { error } = await supabase
        .from('daily_attendance')
        .upsert({
          class_id: classId,
          date: date,
          present_students: presentArray,
          created_by: user.id
        }, {
          onConflict: 'class_id,date'
        });

      if (error) throw error;

      toast({
        title: "Chamada Registrada",
        description: `${presentArray.length} alunos presentes em ${format(new Date(date), 'dd/MM/yyyy')}.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível registrar a chamada.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Realizar Chamada
          </DialogTitle>
          <DialogDescription>
            {className}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Label htmlFor="attendance-date" className="w-20">Data:</Label>
            <input 
              id="attendance-date"
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between border-b pb-2">
            <Label className="text-sm text-muted-foreground">
              {presentStudents.size} de {students.length} presentes
            </Label>
            <Button variant="ghost" size="sm" onClick={toggleAll} className="h-8 text-xs">
              {presentStudents.size === students.length ? (
                <>
                  <Square className="w-3 h-3 mr-1" /> Desmarcar Todos
                </>
              ) : (
                <>
                  <CheckSquare className="w-3 h-3 mr-1" /> Marcar Todos
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      id={`student-${student.id}`} 
                      checked={presentStudents.has(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <Label 
                      htmlFor={`student-${student.id}`} 
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {student.name}
                    </Label>
                  </div>
                ))}
                {students.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum aluno nesta turma.
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Chamada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
