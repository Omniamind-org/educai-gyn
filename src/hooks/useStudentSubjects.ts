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

        // Get teacher details with their subjects
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('id, name, subject')
          .in('id', teacherIds)
          .not('subject', 'is', null);

        if (teachersError) {
          throw teachersError;
        }

        if (!teachersData || teachersData.length === 0) {
          setSubjects([]);
          setLoading(false);
          return;
        }

        // Process subjects - teachers can have multiple subjects (comma-separated)
        const subjectsMap = new Map<string, StudentSubject>();
        let colorIndex = 0;

        teachersData.forEach(teacher => {
          if (!teacher.subject) return;
          
          // Split by comma in case teacher has multiple subjects
          const teacherSubjects = teacher.subject.split(',').map(s => s.trim()).filter(Boolean);
          
          teacherSubjects.forEach(subjectName => {
            const subjectId = subjectName.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            
            if (!subjectsMap.has(subjectId)) {
              subjectsMap.set(subjectId, {
                id: subjectId,
                name: subjectName,
                color: SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length],
                icon: getSubjectIcon(subjectName),
                teacherName: teacher.name,
                teacherId: teacher.id,
              });
              colorIndex++;
            }
          });
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
