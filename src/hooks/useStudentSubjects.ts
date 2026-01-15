import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StudentSubject {
  id: string;
  name: string;
  color: string;
  icon: string;
  teacherName: string;
  teacherId: string;
}

// Color palette for subjects
const SUBJECT_COLORS = [
  'bg-primary/10 text-primary',
  'bg-success/10 text-success',
  'bg-warning/10 text-warning',
  'bg-destructive/10 text-destructive',
  'bg-secondary/10 text-secondary-foreground',
  'bg-accent/10 text-accent-foreground',
];

// Icon mapping based on subject name keywords
function getSubjectIcon(subjectName: string): string {
  const lower = subjectName.toLowerCase();
  if (lower.includes('português') || lower.includes('redação') || lower.includes('literatura')) {
    return 'FileText';
  }
  if (lower.includes('matemática') || lower.includes('cálculo') || lower.includes('geometria')) {
    return 'Calculator';
  }
  return 'BookOpen';
}

export function useStudentSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubjects = async () => {
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
          setSubjects([]);
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
          setSubjects([]);
          setLoading(false);
          return;
        }

        const classIds = classEnrollments.map(e => e.class_id);

        // Get teachers assigned to these classes
        const { data: classTeachers, error: classTeachersError } = await supabase
          .from('class_teachers')
          .select('teacher_id')
          .in('class_id', classIds);

        if (classTeachersError) {
          throw classTeachersError;
        }

        if (!classTeachers || classTeachers.length === 0) {
          setSubjects([]);
          setLoading(false);
          return;
        }

        const teacherIds = [...new Set(classTeachers.map(ct => ct.teacher_id))];

        // Get teachers with their assigned disciplines
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('id, name')
          .in('id', teacherIds);

        if (teachersError) {
          throw teachersError;
        }

        // Get teacher disciplines
        const { data: teacherDisciplines } = await supabase
          .from('teacher_disciplines')
          .select('teacher_id, discipline_id')
          .in('teacher_id', teacherIds);

        // Get discipline details
        const disciplineIds = [...new Set((teacherDisciplines || []).map(td => td.discipline_id))];
        const { data: disciplinesData } = await supabase
          .from('disciplines')
          .select('id, name')
          .in('id', disciplineIds);

        if (!disciplinesData || disciplinesData.length === 0) {
          setSubjects([]);
          setLoading(false);
          return;
        }

        // Build subjects from disciplines and their teachers
        const subjectsMap = new Map<string, StudentSubject>();
        let colorIndex = 0;

        (teacherDisciplines || []).forEach(td => {
          const discipline = disciplinesData.find(d => d.id === td.discipline_id);
          const teacher = (teachersData || []).find(t => t.id === td.teacher_id);
          
          if (!discipline || !teacher) return;

          const subjectKey = `${discipline.id}_${teacher.id}`;
          
          if (!subjectsMap.has(subjectKey)) {
            subjectsMap.set(subjectKey, {
              id: subjectKey,
              name: discipline.name,
              color: SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length],
              icon: getSubjectIcon(discipline.name),
              teacherName: teacher.name,
              teacherId: teacher.id,
            });
            colorIndex++;
          }
        });

        setSubjects(Array.from(subjectsMap.values()));
      } catch (err) {
        console.error('Error fetching student subjects:', err);
        setError('Erro ao carregar matérias');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  return { subjects, loading, error };
}
