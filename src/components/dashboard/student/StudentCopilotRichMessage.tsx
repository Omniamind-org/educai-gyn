import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatConfidenceLabel } from "@/lib/student-copilot";
import type {
  DashboardChatMessage,
  StudentCopilotSubmissionDraft,
  StudentCopilotTaskCandidate,
} from "@/types/student-copilot";
import { CheckCircle2, FileText, Loader2, Sparkles } from "lucide-react";

interface StudentCopilotRichMessageProps {
  message: DashboardChatMessage;
  confirmingTaskId: string | null;
  onChooseTask: (message: DashboardChatMessage, candidate: StudentCopilotTaskCandidate) => void;
  onConfirmSubmission: (draft: StudentCopilotSubmissionDraft) => void;
}

function formatDueDateLabel(dueDate: string | null | undefined) {
  if (!dueDate) return "Sem prazo informado";
  return new Date(dueDate).toLocaleDateString("pt-BR");
}

function formatConfidenceValue(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

export function StudentCopilotRichMessage({
  message,
  confirmingTaskId,
  onChooseTask,
  onConfirmSubmission,
}: StudentCopilotRichMessageProps) {
  const response = message.studentCopilot;

  if (!response) {
    return null;
  }

  return (
    <div className="space-y-3">
      {response.candidateTasks && response.candidateTasks.length > 0 ? (
        <Card className="border-border/60 bg-background/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Escolha a tarefa correta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {response.candidateTasks.map((candidate) => (
              <div
                key={candidate.taskId}
                className="rounded-lg border border-border/60 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{candidate.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {candidate.disciplineName || "Disciplina não identificada"} • {candidate.className}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {formatConfidenceLabel(candidate.confidence)} {formatConfidenceValue(candidate.confidence)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{candidate.reason}</p>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    Entrega: {formatDueDateLabel(candidate.dueDate)}
                  </Badge>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => onChooseTask(message, candidate)}
                  >
                    Usar esta tarefa
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {response.submissionDraft ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Confirmar entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-sm">{response.submissionDraft.title}</p>
              <p className="text-xs text-muted-foreground">
                {response.submissionDraft.disciplineName || "Disciplina não identificada"} • {response.submissionDraft.className}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px]">
                Entrega: {formatDueDateLabel(response.submissionDraft.dueDate)}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Confiança {formatConfidenceValue(response.submissionDraft.confidence)}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Fonte: {response.submissionDraft.source === "pdf_and_text"
                  ? "PDF + texto"
                  : response.submissionDraft.source === "pdf"
                    ? "PDF"
                    : "Texto"}
              </Badge>
            </div>

            {response.submissionDraft.attachment ? (
              <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                <p className="text-xs font-medium">Arquivo anexado</p>
                <p className="text-xs text-muted-foreground truncate">
                  {response.submissionDraft.attachment.name}
                </p>
              </div>
            ) : null}

            {response.submissionDraft.extractedTextSnippet ? (
              <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                <p className="text-xs font-medium mb-1">Prévia identificada</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {response.submissionDraft.extractedTextSnippet}
                </p>
              </div>
            ) : null}

            {response.submissionDraft.studentMessage ? (
              <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                <p className="text-xs font-medium mb-1">Mensagem enviada</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {response.submissionDraft.studentMessage}
                </p>
              </div>
            ) : null}

            <Button
              className="w-full"
              onClick={() => onConfirmSubmission(response.submissionDraft!)}
              disabled={confirmingTaskId === response.submissionDraft.taskId}
            >
              {confirmingTaskId === response.submissionDraft.taskId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando entrega...
                </>
              ) : (
                "Confirmar entrega"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {response.deliveryResult ? (
        <Card className="border-success/30 bg-success/10">
          <CardContent className="pt-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Entrega registrada</p>
              <p className="text-xs text-muted-foreground">
                Enviado em {new Date(response.deliveryResult.submittedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
