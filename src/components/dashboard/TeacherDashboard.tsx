import { useState } from 'react';
import { StudentProgressAnalysis } from './teacher/StudentProgressAnalysis';
import { ClassDetailView } from './teacher/ClassDetailView';
import { LessonPlanEditor } from './teacher/LessonPlanEditor';
import { SavedLessonPlansView } from './teacher/SavedLessonPlansView';
import { ExerciseListEditor } from './teacher/ExerciseListEditor';
import { SavedExerciseListsView } from './teacher/SavedExerciseListsView';
import { SatisfactionSurveyDialog } from './teacher/SatisfactionSurveyDialog';
import { useTeacherDashboard } from '@/hooks/dashboard/useTeacherDashboard';
import { ClassWithDetails, GeneratedLessonPlan, GeneratedExerciseList, TeacherView } from '@/types/teacher';
import { TeacherSurveyAlert } from './teacher/TeacherSurveyAlert';
import { TeacherDisciplinesCard } from './teacher/TeacherDisciplinesCard';
import { TeacherProgressCard } from './teacher/TeacherProgressCard';
import { TeacherAgentMaker } from './teacher/TeacherAgentMaker';
import { TeacherClassesList } from './teacher/TeacherClassesList';

export function TeacherDashboard() {
  const { 
    teacherId, 
    classes, 
    teacherDisciplines, 
    isLoading, 
    activeCampaign, 
    showSurveyAlert, 
    setShowSurveyAlert,
    refreshData 
  } = useTeacherDashboard();

  const [currentView, setCurrentView] = useState<TeacherView>('dashboard');
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [generatedExerciseList, setGeneratedExerciseList] = useState<GeneratedExerciseList | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);

  // Show Saved Exercise Lists View
  if (currentView === 'saved-exercise-lists' && teacherId) {
    return (
      <SavedExerciseListsView
        teacherId={teacherId}
        onBack={() => setCurrentView('dashboard')}
        onOpenList={(list) => {
          setGeneratedExerciseList({
            id: list.id,
            content: list.content,
            topic: list.topic,
            series: list.series || '',
            bnccObjective: list.bncc_objective || '',
          });
          setCurrentView('exercise-list-editor');
        }}
      />
    );
  }

  // Show Exercise List Editor
  if (currentView === 'exercise-list-editor' && generatedExerciseList) {
    return (
      <ExerciseListEditor
        listId={generatedExerciseList.id}
        exerciseList={generatedExerciseList.content}
        topic={generatedExerciseList.topic}
        series={generatedExerciseList.series}
        bnccObjective={generatedExerciseList.bnccObjective}
        teacherId={teacherId}
        onBack={() => {
          setCurrentView('saved-exercise-lists');
          setGeneratedExerciseList(null);
        }}
        onSaved={(id) => {
          setGeneratedExerciseList(prev => prev ? { ...prev, id } : null);
        }}
      />
    );
  }

  // Show Saved Lesson Plans View
  if (currentView === 'saved-plans' && teacherId) {
    return (
      <SavedLessonPlansView
        teacherId={teacherId}
        onBack={() => setCurrentView('dashboard')}
        onOpenPlan={(plan) => {
          setGeneratedPlan({
            id: plan.id,
            content: plan.content,
            topic: plan.topic,
            series: plan.series || '',
            bnccObjective: plan.bncc_objective || '',
          });
          setCurrentView('lesson-plan-editor');
        }}
      />
    );
  }

  // Show Lesson Plan Editor
  if (currentView === 'lesson-plan-editor' && generatedPlan) {
    return (
      <LessonPlanEditor
        planId={generatedPlan.id}
        lessonPlan={generatedPlan.content}
        topic={generatedPlan.topic}
        series={generatedPlan.series}
        bnccObjective={generatedPlan.bnccObjective}
        teacherId={teacherId}
        onBack={() => {
          setCurrentView('saved-plans');
          setGeneratedPlan(null);
        }}
        onSaved={(id) => {
          setGeneratedPlan(prev => prev ? { ...prev, id } : null);
        }}
      />
    );
  }

  // Show Class Detail View
  if (currentView === 'class-detail' && selectedClass && teacherId) {
    return (
      <ClassDetailView
        classData={selectedClass}
        teacherId={teacherId}
        onBack={() => {
          setCurrentView('dashboard');
          setSelectedClass(null);
        }}
      />
    );
  }

  // Show Progress Analysis View
  if (currentView === 'progress-analysis') {
    return (
      <StudentProgressAnalysis
        onBack={() => setCurrentView('dashboard')}
        onStartPlanning={() => {
          // Trigger AI message for planning
          if ((window as any).addAIMessage) {
            (window as any).addAIMessage(
              '🎯 Vamos criar um plano pedagógico personalizado! Me conte: qual é o tema que você quer trabalhar e para qual turma? Posso sugerir atividades, trilhas de aprendizagem e materiais adaptados.'
            );
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TeacherSurveyAlert 
        activeCampaign={activeCampaign}
        isVisible={showSurveyAlert}
        onOpenSurvey={() => setSurveyOpen(true)}
        onCloseAlert={() => setShowSurveyAlert(false)}
      />

      <TeacherDisciplinesCard disciplines={teacherDisciplines} />

      <TeacherProgressCard onClick={() => setCurrentView('progress-analysis')} />

      <TeacherAgentMaker 
        onPlanGenerated={(plan) => {
          setGeneratedPlan(plan);
          setCurrentView('lesson-plan-editor');
        }}
        onExerciseListGenerated={(list) => {
          setGeneratedExerciseList(list);
          setCurrentView('exercise-list-editor');
        }}
        onViewSavedPlans={() => setCurrentView('saved-plans')}
        onViewSavedLists={() => setCurrentView('saved-exercise-lists')}
      />

      <TeacherClassesList 
        classes={classes}
        isLoading={isLoading}
        onSelectClass={(cls) => {
          setSelectedClass(cls);
          setCurrentView('class-detail');
        }}
      />

      {teacherId && activeCampaign && (
        <SatisfactionSurveyDialog
          open={surveyOpen}
          onOpenChange={(open) => {
            setSurveyOpen(open);
            if (!open) {
              refreshData(); // Re-check if survey is still active (answered?)
            }
          }}
          teacherId={teacherId}
          campaignId={activeCampaign.id}
          campaignTitle={activeCampaign.title}
        />
      )}
    </div>
  );
}
