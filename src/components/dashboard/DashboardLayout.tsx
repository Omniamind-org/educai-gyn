import { ReactNode } from "react";
import { LogOut, BookOpen, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AISidebar } from "./AISidebar";
import { MobileChatBar } from "./MobileChatBar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

const ROLE_LABELS: Record<string, string> = {
  aluno: "Aluno",
  professor: "Professor",
  coordenacao: "Coordenação",
  diretor: "Diretor",
  secretaria: "Secretaria",
  regional: "Gestão Estratégica Regional",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-32">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Aprendu</span>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="p-4 animate-fade-in">
          {children}
        </main>

        {/* Mobile Chat Bar */}
        <MobileChatBar />
      </div>
    );
  }

  // Desktop Layout
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

      {/* AI Sidebar - Desktop Only (not for regional) */}
      {role !== 'regional' && <AISidebar />}
    </div>
  );
}
