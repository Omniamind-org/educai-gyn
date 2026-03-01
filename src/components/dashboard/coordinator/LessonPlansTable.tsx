import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle, AlertCircle, User, Loader2, Check, X } from "lucide-react";
import { LessonPlan } from "@/types/coordinator";

interface LessonPlansTableProps {
  plans: LessonPlan[];
  loading: boolean;
  onCompetenceClick: (competence: string | null) => void;
  onStatusUpdate: (planId: number, status: 'approved' | 'pending') => void;
  onBulkStatusUpdate: (planIds: number[], status: 'approved' | 'pending') => void;
}

export function LessonPlansTable({
  plans,
  loading,
  onCompetenceClick,
  onStatusUpdate,
  onBulkStatusUpdate
}: LessonPlansTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === plans.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(plans.map(p => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    onBulkStatusUpdate(selectedIds, 'approved');
    setSelectedIds([]);
  };

  const handleBulkPending = () => {
    onBulkStatusUpdate(selectedIds, 'pending');
    setSelectedIds([]);
  };

  const selectedPlans = plans.filter(p => selectedIds.includes(p.id));
  const hasPendingSelected = selectedPlans.some(p => p.status === 'pending');
  const hasApprovedSelected = selectedPlans.some(p => p.status === 'approved');

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Radar BNCC - Planos de Aula
          </CardTitle>
          <CardDescription>
            Gerencie a aderência dos planos de aula à BNCC
          </CardDescription>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm font-medium mr-2">
              {selectedIds.length} selecionado(s)
            </span>

            {hasPendingSelected && (
              <Button
                size="sm"
                variant="default"
                className="bg-success hover:bg-success/90 text-white"
                onClick={handleBulkApprove}
              >
                <Check className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
            )}

            {hasApprovedSelected && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={handleBulkPending}
              >
                <X className="w-4 h-4 mr-1" />
                Pendente
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
            >
              Cancelar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando planos de aula...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.length === plans.length && plans.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Série</TableHead>
                <TableHead>Aderência BNCC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan, index) => (
                <TableRow
                  key={plan.id}
                  className={`opacity-0 animate-fade-in transition-colors ${selectedIds.includes(plan.id) ? 'bg-muted/50' : ''}`}
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(plan.id)}
                      onCheckedChange={() => toggleSelect(plan.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${plan.teacher}`} />
                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{plan.teacher}</span>
                    </div>
                  </TableCell>
                  <TableCell>{plan.subject}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{plan.topic}</TableCell>
                  <TableCell>{plan.grade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${plan.bnccScore >= 80 ? 'bg-success' :
                            plan.bnccScore >= 60 ? 'bg-warning' : 'bg-destructive'
                            }`}
                          style={{ width: `${plan.bnccScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{plan.bnccScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.status === 'approved' ? (
                      <Badge className="bg-success/10 text-success hover:bg-success/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aderente
                      </Badge>
                    ) : (
                      <Badge
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer"
                        onClick={() => onCompetenceClick(plan.missingCompetence)}
                        title="Ver sugestões de adequação"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Falta {plan.missingCompetence}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {plan.status === 'pending' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                        onClick={() => onStatusUpdate(plan.id, 'approved')}
                        title="Aprovar Plano"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onStatusUpdate(plan.id, 'pending')}
                        title="Marcar como Pendente"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
