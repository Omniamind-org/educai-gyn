import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard';
import { DirectorDashboard } from '@/components/dashboard/DirectorDashboard';
import { SecretaryDashboard } from '@/components/dashboard/SecretaryDashboard';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, role, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Perfil não configurado</CardTitle>
            <CardDescription>
              Sua conta entrou, mas ainda não foi associada a um perfil (aluno/professor/coordenacao/diretor).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
            >
              Sair
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      case 'secretaria':
        return <SecretaryDashboard />;
      default:
        return null;
    }
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
}
