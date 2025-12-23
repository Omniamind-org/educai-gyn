import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROLE_CONFIGS } from '@/types/roles';
import { RoleCard } from './RoleCard';

export function LandingScreen() {
  const navigate = useNavigate();

  const handleRoleClick = (role: 'aluno' | 'professor' | 'coordenacao' | 'diretor' | null) => {
    if (!role) return;
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-card flex flex-col items-center justify-center p-8">
      {/* Logo & Branding */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-primary">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">EducAI</h1>
        </div>
        <p className="text-lg text-muted-foreground">Plataforma de Gestão Educacional Inteligente</p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {ROLE_CONFIGS.map((config, index) => (
          <RoleCard
            key={config.id}
            config={config}
            onClick={handleRoleClick}
            delay={100 + index * 100}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
        Selecione seu perfil para entrar com as credenciais de teste
      </p>
    </div>
  );
}
