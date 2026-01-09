import { ReactNode } from "react";
import { LogOut, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AISidebar } from "./AISidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const ROLE_LABELS: Record<string, string> = {
  aluno: "Aluno",
  professor: "Professor",
  coordenacao: "Coordenação",
  diretor: "Diretor",
  secretaria: "Secretaria",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Aprendu</h1>
              <p className="text-sm text-muted-foreground">{role && ROLE_LABELS[role]}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </header>

        {/* Page Content */}
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* AI Sidebar - Always Fixed */}
      <AISidebar />
    </div>
  );
}
