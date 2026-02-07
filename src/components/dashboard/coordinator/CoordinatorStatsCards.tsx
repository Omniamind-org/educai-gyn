import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { CoordinatorStats } from "@/types/coordinator";
interface CoordinatorStatsCardsProps {
  stats: CoordinatorStats;
}

export function CoordinatorStatsCards({ stats }: CoordinatorStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '0ms' }}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Planos de Aula</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.approved}</p>
            <p className="text-sm text-muted-foreground">Aderentes à BNCC</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Precisam Revisão</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
