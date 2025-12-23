import { useApp } from '@/contexts/AppContext';
import { LandingScreen } from '@/components/landing/LandingScreen';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard';
import { DirectorDashboard } from '@/components/dashboard/DirectorDashboard';

const Index = () => {
  const { currentRole } = useApp();

  // Show landing if no role selected
  if (!currentRole) {
    return <LandingScreen />;
  }

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (currentRole) {
      case 'aluno':
        return <StudentDashboard />;
      case 'professor':
        return <TeacherDashboard />;
      case 'coordenacao':
        return <CoordinatorDashboard />;
      case 'diretor':
        return <DirectorDashboard />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Index;