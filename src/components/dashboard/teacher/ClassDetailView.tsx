import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, BookOpen, Loader2, GraduationCap, ClipboardList, Save, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  grade: string;
}

interface Discipline {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  status: string;
  created_at: string;
  discipline_id: string | null;
}

interface StudentGrade {
  student_id: string;
  task_id: string;
  score: number | null;
}

interface ClassDetailViewProps {
  classData: {
    id: string;
    name: string;
    grade: string;
    year: number;
  };
  teacherId: string;
  onBack: () => void;
}

export function ClassDetailView({ classData, teacherId, onBack }: ClassDetailViewProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, number | null>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSavingGrades, setIsSavingGrades] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [tasksListOpen, setTasksListOpen] = useState(false);
  const [studentsListOpen, setStudentsListOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    max_score: '10',
    due_date: '',
    discipline_id: '',
  });
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    max_score: '10',
    due_date: '',
    discipline_id: '',
  });

  useEffect(() => {
    fetchClassData();
    fetchTeacherDisciplines();
  }, [classData.id, teacherId]);

  const fetchTeacherDisciplines = async () => {
    try {
      // Fetch disciplines that this teacher is assigned to
      const { data: teacherDiscs } = await supabase
        .from('teacher_disciplines')
        .select('discipline_id')
        .eq('teacher_id', teacherId);

      if (teacherDiscs && teacherDiscs.length > 0) {
        const discIds = teacherDiscs.map(td => td.discipline_id);
        const { data: discsData } = await supabase
          .from('disciplines')
          .select('id, name')
          .in('id', discIds)
          .order('name', { ascending: true });
        
        setDisciplines(discsData || []);
      } else {
        setDisciplines([]);
      }
    } catch (error) {
      console.error('Error fetching disciplines:', error);
    }
  };


  const fetchClassData = async () => {
    setIsLoading(true);
    try {
      // Fetch students in this class
      const { data: classStudents } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classData.id);

      if (classStudents && classStudents.length > 0) {
        const studentIds = classStudents.map(cs => cs.student_id);
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, name, grade')
          .in('id', studentIds);
        
        setStudents(studentsData || []);
      } else {
        setStudents([]);
      }

      // Fetch tasks for this class
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('class_id', classData.id)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false });

      setTasks(tasksData || []);

      // Fetch grades for all students and tasks
      if (tasksData && tasksData.length > 0) {
        const taskIds = tasksData.map(t => t.id);
        const { data: gradesData } = await supabase
          .from('student_grades')
          .select('student_id, task_id, score')
          .in('task_id', taskIds);

        // Build grades lookup: grades[studentId][taskId] = score
        const gradesMap: Record<string, Record<string, number | null>> = {};
        gradesData?.forEach(g => {
          if (!gradesMap[g.student_id]) {
            gradesMap[g.student_id] = {};
          }
          gradesMap[g.student_id][g.task_id] = g.score;
        });
        setGrades(gradesMap);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da turma.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título da tarefa é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!newTask.discipline_id) {
      toast({
        title: 'Erro',
        description: 'Selecione a disciplina da tarefa.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingTask(true);
    try {
      const { error } = await supabase.from('tasks').insert({
        class_id: classData.id,
        teacher_id: teacherId,
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        max_score: parseFloat(newTask.max_score) || 10,
        due_date: newTask.due_date || null,
        discipline_id: newTask.discipline_id,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso!',
      });

      setNewTask({ title: '', description: '', max_score: '10', due_date: '', discipline_id: '' });
      setNewTaskOpen(false);
      fetchClassData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingTask(false);
    }



  const handleGradeChange = (studentId: string, taskId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [taskId]: numValue,
      },
    }));
  };

  const handleSaveGrades = async () => {
    setIsSavingGrades(true);
    try {
      // Prepare upsert data
      const upsertData: { task_id: string; student_id: string; score: number | null; graded_at: string }[] = [];

      Object.entries(grades).forEach(([studentId, studentGrades]) => {
        Object.entries(studentGrades).forEach(([taskId, score]) => {
          upsertData.push({
            task_id: taskId,
            student_id: studentId,
            score: score,
            graded_at: new Date().toISOString(),
          });
        });
      });

      if (upsertData.length > 0) {
        const { error } = await supabase
          .from('student_grades')
          .upsert(upsertData, { onConflict: 'task_id,student_id' });

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Notas salvas com sucesso!',
      });
    } catch (error) {
      console.error('Error saving grades:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as notas.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingGrades(false);
    }
  };

  const getGradeValue = (studentId: string, taskId: string): string => {
    const score = grades[studentId]?.[taskId];
    return score !== null && score !== undefined ? score.toString() : '';
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description || '',
      max_score: task.max_score.toString(),
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      discipline_id: task.discipline_id || '',
    });
    setEditTaskOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !editTask.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título da tarefa é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingTask(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTask.title.trim(),
          description: editTask.description.trim() || null,
          max_score: parseFloat(editTask.max_score) || 10,
          due_date: editTask.due_date || null,
          discipline_id: editTask.discipline_id || null,
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso!',
      });

      setEditTaskOpen(false);
      setSelectedTask(null);
      fetchClassData();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    setIsDeletingTask(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tarefa excluída com sucesso!',
      });

      setDeleteTaskOpen(false);
      setSelectedTask(null);
      fetchClassData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingTask(false);
    }
  };

  const openDeleteConfirm = (task: Task) => {
    setSelectedTask(task);
    setDeleteTaskOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {classData.name}
          </h1>
          <p className="text-muted-foreground">{classData.grade} • {classData.year}</p>
        </div>
        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Adicione uma nova tarefa para esta turma.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Título *</Label>
                <Input
                  id="task-title"
                  placeholder="Ex: Prova de Matemática"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Descrição</Label>
                <Textarea
                  id="task-description"
                  placeholder="Descreva a tarefa..."
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-discipline">Disciplina *</Label>
                <Select
                  value={newTask.discipline_id}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, discipline_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.length === 0 ? (
                      <SelectItem value="" disabled>Nenhuma disciplina disponível</SelectItem>
                    ) : (
                      disciplines.map((disc) => (
                        <SelectItem key={disc.id} value={disc.id}>{disc.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-max-score">Nota Máxima</Label>
                  <Input
                    id="task-max-score"
                    type="number"
                    value={newTask.max_score}
                    onChange={(e) => setNewTask(prev => ({ ...prev, max_score: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Data de Entrega</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewTaskOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTask} disabled={isCreatingTask}>
                {isCreatingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Tarefa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setStudentsListOpen(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-sm text-muted-foreground">Alunos</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setTasksListOpen(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <ClipboardList className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-sm text-muted-foreground">Tarefas Ativas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List Dialog */}
      <Dialog open={studentsListOpen} onOpenChange={setStudentsListOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alunos - {classData.name}
            </DialogTitle>
            <DialogDescription>
              Lista de todos os alunos desta turma
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum aluno cadastrado nesta turma.</p>
              </div>
            ) : (
              students.map(student => (
                <Card key={student.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">{student.grade}</p>
                    </div>
                    <Badge variant="outline">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Aluno
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tasks List Dialog */}
      <Dialog open={tasksListOpen} onOpenChange={setTasksListOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Tarefas Ativas - {classData.name}
            </DialogTitle>
            <DialogDescription>
              Lista de todas as tarefas ativas desta turma
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa ativa.</p>
              </div>
            ) : (
              tasks.map(task => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-lg">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">Nota máx: {task.max_score}</Badge>
                          {task.due_date && (
                            <Badge variant="secondary">
                              Entrega: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTask(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteConfirm(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Altere os dados da tarefa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Título *</Label>
              <Input
                id="edit-task-title"
                placeholder="Ex: Prova de Matemática"
                value={editTask.title}
                onChange={(e) => setEditTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Descrição</Label>
              <Textarea
                id="edit-task-description"
                placeholder="Descreva a tarefa..."
                value={editTask.description}
                onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-max-score">Nota Máxima</Label>
                <Input
                  id="edit-task-max-score"
                  type="number"
                  value={editTask.max_score}
                  onChange={(e) => setEditTask(prev => ({ ...prev, max_score: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-due-date">Data de Entrega</Label>
                <Input
                  id="edit-task-due-date"
                  type="date"
                  value={editTask.due_date}
                  onChange={(e) => setEditTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTask} disabled={isUpdatingTask}>
              {isUpdatingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog open={deleteTaskOpen} onOpenChange={setDeleteTaskOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa "{selectedTask?.title}"? 
              Esta ação não pode ser desfeita e todas as notas associadas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={isDeletingTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grades Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Notas dos Alunos
            </CardTitle>
            <CardDescription>
              Visualize e edite as notas de cada aluno por tarefa
            </CardDescription>
          </div>
          {tasks.length > 0 && students.length > 0 && (
            <Button onClick={handleSaveGrades} disabled={isSavingGrades} className="gap-2">
              {isSavingGrades ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Notas
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno cadastrado nesta turma.</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tarefa ativa. Crie uma nova tarefa para lançar notas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Aluno</TableHead>
                    {tasks.map(task => (
                      <TableHead key={task.id} className="min-w-[120px] text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{task.title}</span>
                          <Badge variant="outline" className="text-xs mt-1">
                            Max: {task.max_score}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      {tasks.map(task => (
                        <TableCell key={task.id} className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max={task.max_score}
                            step="0.1"
                            className="w-20 mx-auto text-center"
                            placeholder="-"
                            value={getGradeValue(student.id, task.id)}
                            onChange={(e) => handleGradeChange(student.id, task.id, e.target.value)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
