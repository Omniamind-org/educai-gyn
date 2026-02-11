import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, TrendingUp, FileText } from "lucide-react";
import { DashboardStats } from "@/types/director";

interface DirectorStatsGridProps {
  stats: DashboardStats | null;
}

export function DirectorStatsGrid({ stats }: DirectorStatsGridProps) {
  const inadimplenciaPercent = stats && stats.totalBoletos > 0
    ? Math.round(((stats.boletosPendentes + stats.boletosVencidos) / stats.totalBoletos) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
            <p className="text-sm text-muted-foreground">Alunos ({stats?.activeStudents || 0} ativos)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary/10">
            <GraduationCap className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.totalTeachers || 0}</p>
            <p className="text-sm text-muted-foreground">Professores</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10">
            <DollarSign className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">R$ {((stats?.totalReceita || 0) / 1000).toFixed(1)}K</p>
            <p className="text-sm text-muted-foreground">Receita (boletos pagos)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <TrendingUp className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{inadimplenciaPercent}%</p>
            <p className="text-sm text-muted-foreground">Taxa Inadimplência</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10">
            <FileText className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.boletosVencidos || 0}</p>
            <p className="text-sm text-muted-foreground">Boletos Vencidos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
