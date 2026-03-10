import { useRef } from "react";
import {
  Bot,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { useDashboardChat } from "@/hooks/useDashboardChat";
import { StudentCopilotRichMessage } from "@/components/dashboard/student/StudentCopilotRichMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PERSONAS = [
  { id: "padrao", label: "Padrão" },
  { id: "cora", label: "Cora Coralina (Regional)" },
  { id: "cientista", label: "Cientista" },
];

export function AISidebar() {
  const { role } = useAuth();
  const { aiPersona, setAiPersona } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isStudent,
    messages,
    input,
    setInput,
    pendingFile,
    setPendingFile,
    isLoading,
    isUploadingFile,
    confirmingTaskId,
    handleSend,
    generatePDF,
    handleChooseStudentTask,
    handleConfirmStudentSubmission,
  } = useDashboardChat();

  return (
    <aside className="ai-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">
              IA Assistente
            </h2>
            <p className="text-xs text-muted-foreground">
              Powered by GPT-5 Nano
            </p>
          </div>
        </div>

        {/* Persona Selector (only for professors) */}
        {role === "professor" && (
          <Select value={aiPersona} onValueChange={setAiPersona}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Definir Persona" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map((persona) => (
                <SelectItem key={persona.id} value={persona.label}>
                  {persona.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
                index === messages.length - 1 && "animate-fade-in",
              )}
            >
              <div
                className={cn(
                  "chat-bubble",
                  message.role === "assistant"
                    ? "chat-bubble-ai"
                    : "chat-bubble-user",
                  "flex flex-col gap-2 max-w-full",
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {message.attachments?.length ? (
                  <div className="space-y-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.path}
                        className="rounded-lg bg-white/10 px-3 py-2 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {message.role === "assistant" &&
                (message.isDocument ||
                  message.content.includes("[DOCUMENTO]") ||
                  message.content.includes("<document>")) ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-1 gap-2 bg-white/20 hover:bg-white/30 text-inherit border-0"
                    onClick={() => generatePDF(message.content)}
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </Button>
                ) : null}

                {message.role === "assistant" && message.studentCopilot ? (
                  <StudentCopilotRichMessage
                    message={message}
                    confirmingTaskId={confirmingTaskId}
                    onChooseTask={handleChooseStudentTask}
                    onConfirmSubmission={handleConfirmStudentSubmission}
                  />
                ) : null}
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="flex justify-start animate-fade-in">
              <div className="chat-bubble chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {isUploadingFile ? "Anexando PDF..." : "Pensando..."}
                </span>
              </div>
            </div>
          ) : null}
        </div>

      {/* Input Area */}
      <div className="p-4 border-t border-sidebar-border">
        {isStudent ? (
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) =>
              setPendingFile(event.target.files?.[0] || null)
            }
          />
        ) : null}

        {isStudent && pendingFile ? (
          <div className="mb-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm truncate flex-1">{pendingFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setPendingFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : null}

        <div className="flex gap-2 items-center">
          {isStudent ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          ) : null}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isStudent
                ? "Digite sua mensagem ou anexe um PDF..."
                : "Digite sua mensagem..."
            }
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={() => void handleSend()}
            disabled={isLoading || (!input.trim() && !(isStudent && pendingFile))}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
