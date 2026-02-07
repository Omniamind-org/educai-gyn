import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import { DashboardStats, BoletosByGrade } from "@/types/director";

interface DirectorChartsProps {
  boletosByGrade: BoletosByGrade[];
  stats: DashboardStats | null;
}

export function DirectorCharts({ boletosByGrade, stats }: DirectorChartsProps) {
  const enrollmentData = [
    { name: 'Matriculados', value: stats?.activeStudents || 0, color: 'hsl(142, 76%, 36%)' },
    { name: 'Meta Restante', value: Math.max(0, 1000 - (stats?.activeStudents || 0)), color: 'hsl(220, 14%, 90%)' },
  ];

  const enrollmentPercent = stats ? Math.min(100, Math.round((stats.activeStudents / 1000) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Delinquency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-destructive" />
            Inadimplência por Série
          </CardTitle>
        </CardHeader>
        <CardContent>
          {boletosByGrade.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={boletosByGrade}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="grade" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="valor" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Nenhum dado de inadimplência
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-primary" />
            Meta de Matrículas {new Date().getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={enrollmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{enrollmentPercent}%</p>
                <p className="text-xs text-muted-foreground">da meta</p>
              </div>
            </div>
          </div>
          <div className="ml-6 space-y-2">
            <p className="text-sm"><span className="font-semibold">{stats?.activeStudents || 0}</span> matriculados</p>
            <p className="text-sm"><span className="font-semibold">1.000</span> meta anual</p>
            <p className="text-sm text-muted-foreground">Faltam {Math.max(0, 1000 - (stats?.activeStudents || 0))} alunos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
