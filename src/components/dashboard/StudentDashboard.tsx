import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LearningProgressView } from './student/LearningProgressView';
import { ObjectiveSelectionView, StudyObjective } from './student/ObjectiveSelectionView';
import { StudyChatView } from './student/StudyChatView';
import { useStudentTasks, StudentTask } from '@/hooks/useStudentTasks';
import { useStudentSubjects, StudentSubject } from '@/hooks/useStudentSubjects';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { StudentGamificationBar } from './student/StudentGamificationBar';
import { StudentSubjectsList } from './student/StudentSubjectsList';
import { StudentTasksList } from './student/StudentTasksList';
import { StudentTaskDetailView } from './student/StudentTaskDetailView';
import { StudentSubjectView } from './student/StudentSubjectView';

type StudentView = 'dashboard' | 'progress' | 'objectives' | 'study-chat';

export function StudentDashboard() {
  const { tasks, loading: tasksLoading } = useStudentTasks();
  const { subjects, loading: subjectsLoading } = useStudentSubjects();
  const { profile: studentProfile } = useStudentProfile();
  
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [selectedObjective, setSelectedObjective] = useState<StudyObjective | null>(null);
  const [selectedTask, setSelectedTask] = useState<StudentTask | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(null);

  const handleTaskClick = (task: StudentTask) => {
    setSelectedTask(task);
    // Trigger AI message when task is opened
    if (window.addAIMessage) {
      setTimeout(() => {
        window.addAIMessage!(
          `Olá! Vi que você vai trabalhar na atividade "${task.title}". Quer que eu te ajude com dicas ou analise seu progresso? 📝`
        );
      }, 500);
    }
  };

  const handleSubjectClick = (subject: StudentSubject) => {
    setSelectedSubject(subject);
    setSelectedTask(null);
  };

  const handleObjectiveSelect = (objective: StudyObjective) => {
    setSelectedObjective(objective);
    setCurrentView('study-chat');
  };

  const getSubjectTasks = () => {
    if (!selectedSubject) return [];
    return tasks.filter(task => task.teacherName === selectedSubject.teacherName);
  };

  // View: Study Chat with selected objective
  if (currentView === 'study-chat' && selectedObjective) {
    return (
      <StudyChatView
        objective={selectedObjective}
        onBack={() => {
          setCurrentView('objectives');
          setSelectedObjective(null);
        }}
      />
    );
  }

  // View: Objective Selection
  if (currentView === 'objectives') {
    return (
      <ObjectiveSelectionView
        onBack={() => setCurrentView('progress')}
        onSelectObjective={handleObjectiveSelect}
      />
    );
  }

  // View: Learning Progress
  if (currentView === 'progress') {
    return (
      <LearningProgressView
        onStudyNow={() => setCurrentView('objectives')}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  // View: Selected Subject
  if (selectedSubject) {
    return (
      <StudentSubjectView 
        subject={selectedSubject}
        tasks={getSubjectTasks()}
        onBack={() => setSelectedSubject(null)}
        onSelectTask={(task) => {
          setSelectedSubject(null);
          handleTaskClick(task);
        }}
      />
    );
  }

  // View: Selected Task
  if (selectedTask) {
    return (
      <StudentTaskDetailView 
        task={selectedTask}
        onBack={() => setSelectedTask(null)}
      />
    );
  }

  // Main Dashboard View
  return (
    <div className="space-y-6">
      {/* Gamification Stats */}
      <StudentGamificationBar profile={studentProfile} />

      {/* Learning Progress Button */}
      <Card
        className="cursor-pointer hover:border-primary/50 transition-all group"
        onClick={() => setCurrentView('progress')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Meu Progresso de Aprendizagem</h3>
              <p className="text-muted-foreground text-sm">Acompanhe seu engajamento, sessões e dificuldades</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            Acessar
          </Button>
        </CardContent>
      </Card>

      {/* Pending Activities */}
      <StudentTasksList 
        tasks={tasks} 
        loading={tasksLoading} 
        onTaskClick={handleTaskClick} 
      />

      {/* Subjects Section */}
      <StudentSubjectsList 
        subjects={subjects} 
        loading={subjectsLoading} 
        onSubjectClick={handleSubjectClick} 
      />
    </div>
  );
}
