import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClipboardCheck, CheckCircle, AlertCircle, User, Loader2 } from "lucide-react";
import { LessonPlan } from "@/types/coordinator";

interface LessonPlansTableProps {
  plans: LessonPlan[];
  loading: boolean;
  onCompetenceClick: (competence: string | null) => void;
}

export function LessonPlansTable({ plans, loading, onCompetenceClick }: LessonPlansTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          Radar BNCC - Planos de Aula
        </CardTitle>
        <CardDescription>
          Clique nas badges vermelhas para ver sugestões de adequação
        </CardDescription>
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
                <TableHead>Professor</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Série</TableHead>
                <TableHead>Aderência BNCC</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan, index) => (
                <TableRow 
                  key={plan.id} 
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
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
                          className={`h-full rounded-full ${
                            plan.bnccScore >= 80 ? 'bg-success' : 
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
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Falta {plan.missingCompetence}
                      </Badge>
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
