import { SchoolUnit } from '@/data/regionalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';

interface SchoolsScatterViewProps {
  schools: SchoolUnit[];
  onSelectSchool: (school: SchoolUnit) => void;
}

export function SchoolsScatterView({ schools, onSelectSchool }: SchoolsScatterViewProps) {
  const data = schools.map(school => ({
    x: school.permanence,
    y: school.averageGrade,
    z: school.totalStudents,
    name: school.name,
    region: school.region,
    riskLevel: school.riskLevel,
    school,
  }));

  const getColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'stable':
        return 'hsl(var(--success))';
      case 'alert':
        return 'hsl(var(--warning))';
      case 'critical':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-xs text-muted-foreground">{data.region}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Permanência: <span className="font-medium">{data.x}%</span></p>
            <p>Média: <span className="font-medium">{data.y}</span></p>
            <p>Alunos: <span className="font-medium">{data.z}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Desempenho vs. Permanência Escolar</CardTitle>
        <p className="text-sm text-muted-foreground">
          Identifique escolas com alta nota mas risco de abandono
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Permanência" 
                unit="%" 
                domain={[50, 100]}
                label={{ value: 'Permanência Escolar (%)', position: 'bottom', offset: 40 }}
                className="text-xs"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Média" 
                domain={[5, 10]}
                label={{ value: 'Média de Notas', angle: -90, position: 'insideLeft' }}
                className="text-xs"
              />
              <ZAxis type="number" dataKey="z" range={[100, 400]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                name="Escolas" 
                data={data} 
                cursor="pointer"
                onClick={(data: any) => onSelectSchool(data.school)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.riskLevel)}
                    fillOpacity={0.7}
                    stroke={getColor(entry.riskLevel)}
                    strokeWidth={2}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Estável</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Alerta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Crítico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
