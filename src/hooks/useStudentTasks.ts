import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface StudentTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  dueDateRaw: string | null;
  maxScore: number;
  status: string;
  type: 'exam' | 'assignment' | 'project' | null;
  className: string;
  classId: string;
  teacherName: string;
  teacherId: string;
  disciplineId: string | null;
  disciplineName: string | null;
  attachmentUrl: string | null;
  submittedAt: string | null;
  hasSubmission: boolean;
}

export function useStudentTasks(enabled = true) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTasks([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the student record
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentError || !student) {
          setTasks([]);
          setLoading(false);
          return;
        }

        // Get the classes the student is enrolled in
        const { data: classEnrollments, error: enrollmentError } = await supabase
          .from('class_students')
          .select('class_id')
          .eq('student_id', student.id);

        if (enrollmentError) {
          throw enrollmentError;
        }

        if (!classEnrollments || classEnrollments.length === 0) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const classIds = classEnrollments.map(e => e.class_id);

        // Get active tasks from these classes
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            due_date,
            max_score,
            class_id,
            teacher_id,
            discipline_id,
            type,
            status,
            attachment_url
          `)
          .in('class_id', classIds)
          .eq('status', 'ativa')
          .order('due_date', { ascending: true });

        if (tasksError) {
          throw tasksError;
        }

        if (!tasksData || tasksData.length === 0) {
          setTasks([]);
          setLoading(false);
          return;
        }

        // Get class names
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds);

        // Get teacher names
        const teacherIds = [...new Set(tasksData.map(t => t.teacher_id))];
        const { data: teachersData } = await supabase
          .from('teachers')
          .select('id, name')
          .in('id', teacherIds);

        const disciplineIds = [
          ...new Set(
            tasksData
              .map((task) => task.discipline_id)
              .filter((disciplineId): disciplineId is string => Boolean(disciplineId)),
          ),
        ];

        const { data: disciplinesData } = disciplineIds.length > 0
          ? await supabase
              .from('disciplines')
              .select('id, name')
              .in('id', disciplineIds)
          : { data: [], error: null };

        const taskIds = tasksData.map((task) => task.id);
        const { data: submissionData } = taskIds.length > 0
          ? await supabase
              .from('student_grades')
              .select('task_id, submitted_at')
              .eq('student_id', student.id)
              .in('task_id', taskIds)
          : { data: [], error: null };

        const classMap = new Map(classesData?.map(c => [c.id, c.name]) || []);
        const teacherMap = new Map(teachersData?.map(t => [t.id, t.name]) || []);
        const disciplineMap = new Map(disciplinesData?.map(d => [d.id, d.name]) || []);
        const submissionMap = new Map(
          (submissionData || []).map((submission) => [submission.task_id, submission.submitted_at]),
        );

        const formattedTasks: StudentTask[] = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDateRaw: task.due_date,
          dueDate: task.due_date
            ? format(new Date(task.due_date), "dd MMM", { locale: ptBR })
            : 'Sem prazo',
          maxScore: task.max_score,
          status: task.status,
          type: task.type,
          className: classMap.get(task.class_id) || 'Turma',
          classId: task.class_id,
          teacherName: teacherMap.get(task.teacher_id) || 'Professor',
          teacherId: task.teacher_id,
          disciplineId: task.discipline_id,
          disciplineName: task.discipline_id
            ? disciplineMap.get(task.discipline_id) || null
            : null,
          attachmentUrl:
            (task as { attachment_url?: string | null }).attachment_url ?? null,
          submittedAt: submissionMap.get(task.id) || null,
          hasSubmission: Boolean(submissionMap.get(task.id)),
        }));

        setTasks(formattedTasks);
      } catch (err) {
        console.error('Error fetching student tasks:', err);
        setError('Erro ao carregar tarefas');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    const handleRefresh = () => {
      void fetchTasks();
    };

    window.addEventListener('studentTaskSubmitted', handleRefresh);

    return () => {
      window.removeEventListener('studentTaskSubmitted', handleRefresh);
    };
  }, [enabled, user]);

  return { tasks, loading, error };
}
