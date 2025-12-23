import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard';
import { DirectorDashboard } from '@/components/dashboard/DirectorDashboard';

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (role) {
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
