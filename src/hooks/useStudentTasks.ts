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
  maxScore: number;
  className: string;
  classId: string;
  teacherName: string;
  attachmentUrl: string | null;
}

export function useStudentTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        const classMap = new Map(classesData?.map(c => [c.id, c.name]) || []);
        const teacherMap = new Map(teachersData?.map(t => [t.id, t.name]) || []);

        const formattedTasks: StudentTask[] = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.due_date
            ? format(new Date(task.due_date), "dd MMM", { locale: ptBR })
            : 'Sem prazo',
          maxScore: task.max_score,
          className: classMap.get(task.class_id) || 'Turma',
          classId: task.class_id,
          teacherName: teacherMap.get(task.teacher_id) || 'Professor',
          attachmentUrl: task.attachment_url,
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
  }, [user]);

  return { tasks, loading, error };
}
