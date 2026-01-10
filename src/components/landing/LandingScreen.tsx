import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROLE_CONFIGS } from "@/types/roles";
import { RoleCard } from "./RoleCard";

export function LandingScreen() {
  const navigate = useNavigate();

  const handleRoleClick = (role: "aluno" | "professor" | "coordenacao" | "diretor" | null) => {
    if (!role) return;
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-card flex flex-col items-center justify-center p-4 md:p-6">
      {/* Logo & Branding */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-primary">
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Aprendu</h1>
        </div>
        <p className="text-sm text-muted-foreground">Plataforma de Gestão Educacional Inteligente</p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl w-full">
        {ROLE_CONFIGS.map((config, index) => (
          <RoleCard key={config.id} config={config} onClick={handleRoleClick} delay={100 + index * 50} />
        ))}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "400ms" }}>
        Selecione seu perfil para entrar com as credenciais de teste
      </p>
    </div>
  );
}
