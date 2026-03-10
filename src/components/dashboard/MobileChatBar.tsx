import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Loader2,
  Paperclip,
  Send,
  ChevronDown,
  X,
} from "lucide-react";
import { useDashboardChat } from "@/hooks/useDashboardChat";
import { StudentCopilotRichMessage } from "@/components/dashboard/student/StudentCopilotRichMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function MobileChatBar() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    handleChooseStudentTask,
    handleConfirmStudentSubmission,
  } = useDashboardChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMobileSend = async () => {
    // Animate to expanded view when sending
    setIsAnimating(true);
    setTimeout(() => {
      setIsExpanded(true);
      setIsAnimating(false);
    }, 50);

    try {
      await handleSend();
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        title: "Erro ao conectar com IA",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    window.openAIChat = () => {
      setIsExpanded(true);
    };

    return () => {
      delete window.openAIChat;
    };
  }, []);

  return (
    <>
      {/* Expanded Chat View with slide-up animation */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background flex flex-col transition-transform duration-300 ease-out",
          isExpanded && !isAnimating ? "translate-y-0" : "translate-y-full",
          !isExpanded && !isAnimating && "pointer-events-none",
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Aprendu IA</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
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

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="chat-bubble chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {isUploadingFile ? "Anexando PDF..." : "Pensando..."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input in Expanded View */}
        <div className="p-4 border-t border-border bg-secondary rounded-t-2xl">
          {isStudent ? (
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                setPendingFile(event.target.files?.[0] || null);
                setIsExpanded(true);
              }}
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

          <div className="flex items-center gap-2">
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
                  : "Pergunte ao Aprendu"
              }
              className="flex-1 bg-muted-foreground/20 border-0"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (() => {
                  e.preventDefault();
                  void handleMobileSend();
                })()
              }
              disabled={isLoading}
              autoFocus
            />
            <Button
              size="icon"
              onClick={() => void handleMobileSend()}
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
      </div>

      {/* Fixed Bottom Chat Bar - Always visible when not expanded */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 bg-secondary border-t border-border rounded-t-2xl p-3 pb-safe shadow-lg transition-opacity duration-200",
          (isExpanded || isAnimating) && "opacity-0 pointer-events-none",
        )}
      >
        {/* Input Row - Now editable inline */}
        <div className="flex items-center gap-2 bg-muted-foreground/20 rounded-xl px-4 py-2 mb-2">
          {isStudent ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          ) : null}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao Aprendu"
            className="flex-1 bg-transparent border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleMobileSend();
              }
            }}
            disabled={isLoading}
          />
        </div>

        {isStudent && pendingFile ? (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate flex-1">{pendingFile.name}</span>
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            size="icon"
            className="h-9 w-9"
            onClick={() => void handleMobileSend()}
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
    </>
  );
}
