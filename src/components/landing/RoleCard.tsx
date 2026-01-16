import { GraduationCap, Presentation, ClipboardCheck, Building, FileText, Network, LucideIcon } from 'lucide-react';
import { RoleConfig, UserRole } from '@/types/roles';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Presentation,
  ClipboardCheck,
  Building,
  FileText,
  Network,
};

interface RoleCardProps {
  config: RoleConfig;
  onClick: (role: UserRole) => void;
  delay: number;
}

export function RoleCard({ config, onClick, delay }: RoleCardProps) {
  const Icon = iconMap[config.icon];

  return (
    <button
      onClick={() => onClick(config.id)}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-4 text-center p-8',
        'bg-white border border-slate-100 rounded-[40px] shadow-sm',
        'transition-all duration-300 ease-out',
        'hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:border-transparent hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        'p-4 rounded-2xl bg-slate-50 text-slate-600 transition-all duration-300',
        'group-hover:bg-white/20 group-hover:text-white group-hover:scale-110'
      )}>
        <Icon className="w-8 h-8" />
      </div>

      <div>
        <h3 className={cn(
          "text-lg font-bold mb-2 transition-colors duration-300",
          "text-slate-800 group-hover:text-white"
        )}>
          {config.title}
        </h3>
        <p className={cn(
          "text-sm font-medium transition-colors duration-300",
          "text-slate-400 group-hover:text-blue-50"
        )}>
          {config.description}
        </p>
      </div>
    </button>
  );
}