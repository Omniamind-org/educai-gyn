import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetConfig } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DistributionWidgetProps {
  config: WidgetConfig;
}

interface DistributionItem {
  label: string;
  value: number;
  color?: string;
}

export function DistributionWidget({ config }: DistributionWidgetProps) {
  const { title, subtitle, data } = config;
  const items: DistributionItem[] = data.rows as unknown as DistributionItem[] || [];

  const defaultColors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="label" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [value, 'Valor']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {items.map((item, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={item.color || defaultColors[idx % defaultColors.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/30">
          <div className="text-center">
            <p className="text-sm font-semibold">{Math.max(...items.map(i => i.value))}</p>
            <p className="text-[10px] text-muted-foreground">Máximo</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">
              {(items.reduce((sum, i) => sum + i.value, 0) / items.length).toFixed(1)}
            </p>
            <p className="text-[10px] text-muted-foreground">Média</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">{Math.min(...items.map(i => i.value))}</p>
            <p className="text-[10px] text-muted-foreground">Mínimo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
