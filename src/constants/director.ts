export const PROJECTS = [
  { id: 1, title: 'Reforma Banheiro Bloco A', status: 'em_andamento', budget: 'R$ 45.000,00', progress: 65 },
  { id: 2, title: 'Verba Parlamentar - Laboratório', status: 'recebida', budget: 'R$ 120.000,00', progress: 100 },
  { id: 3, title: 'Climatização Salas', status: 'planejado', budget: 'R$ 80.000,00', progress: 0 },
  { id: 4, title: 'Material Didático 2024', status: 'em_andamento', budget: 'R$ 25.000,00', progress: 40 },
] as const;

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  em_andamento: { label: 'Em Andamento', className: 'bg-warning/10 text-warning' },
  recebida: { label: 'Recebida', className: 'bg-success/10 text-success' },
  planejado: { label: 'Planejado', className: 'bg-muted text-muted-foreground' },
};
