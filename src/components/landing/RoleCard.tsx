import { GraduationCap, Presentation, ClipboardCheck, Building, FileText, LucideIcon } from 'lucide-react';
import { RoleConfig, UserRole } from '@/types/roles';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Presentation,
  ClipboardCheck,
  Building,
  FileText,
};

interface RoleCardProps {
  config: RoleConfig;
  onClick: (role: UserRole) => void;
  delay: number;
}

export function RoleCard({ config, onClick, delay }: RoleCardProps) {
  const Icon = iconMap[config.icon];
  
  const colorStyles: Record<string, string> = {
    student: 'hover:border-student hover:bg-student/5 group-hover:text-student',
    teacher: 'hover:border-success hover:bg-success/5 group-hover:text-success',
    coordinator: 'hover:border-warning hover:bg-warning/5 group-hover:text-warning',
    director: 'hover:border-director hover:bg-director/5 group-hover:text-director',
    secretary: 'hover:border-secretary hover:bg-secretary/5 group-hover:text-secretary',
  };

  const iconColors: Record<string, string> = {
    student: 'text-student group-hover:scale-110',
    teacher: 'text-success group-hover:scale-110',
    coordinator: 'text-warning group-hover:scale-110',
    director: 'text-director group-hover:scale-110',
    secretary: 'text-secretary group-hover:scale-110',
  };

  return (
    <button
      onClick={() => onClick(config.id)}
      className={cn(
        'group role-card flex flex-col items-center justify-center gap-4 text-center',
        colorStyles[config.colorClass],
        'animate-fade-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        'p-4 rounded-2xl bg-muted transition-all duration-300',
        iconColors[config.colorClass]
      )}>
        <Icon className="w-12 h-12 transition-transform duration-300" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-1">{config.title}</h3>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
    </button>
  );
}