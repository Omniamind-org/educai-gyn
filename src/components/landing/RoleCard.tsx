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
        'group role-card flex flex-col items-center justify-center gap-2 text-center p-4 md:p-5',
        colorStyles[config.colorClass],
        'animate-fade-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        'p-2.5 rounded-xl bg-muted transition-all duration-300',
        iconColors[config.colorClass]
      )}>
        <Icon className="w-7 h-7 md:w-8 md:h-8 transition-transform duration-300" />
      </div>
      <div>
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-0.5">{config.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
      </div>
    </button>
  );
}