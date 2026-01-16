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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <img
              src="/logo-square.png"
              alt="Aprendu"
              className="w-20 h-20 md:w-24 md:h-24"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-blue-500">
              Aprendu
            </h1>
          </div>
          <p className="text-slate-500 text-base md:text-lg max-w-md mx-auto">
            Plataforma de Gestão Educacional Inteligente
          </p>
        </div>

        {/* Role Selection */}
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6">
            <h2 className="text-slate-700 text-lg md:text-xl font-medium mb-2">
              Como você deseja entrar?
            </h2>
            <p className="text-slate-400 text-sm">
              Selecione seu perfil para acessar o sistema
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {ROLE_CONFIGS.map((config, index) => (
              <RoleCard
                key={config.id}
                config={config}
                onClick={handleRoleClick}
                delay={100 + index * 80}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: "600ms" }}>
          <p className="text-slate-400 text-xs">
            © 2026 Aprendu. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
