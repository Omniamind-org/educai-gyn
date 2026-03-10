import { useCallback, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import {
  createDraftFromCandidate,
  parseStudentCopilotResponse,
  sanitizeStorageFileName,
} from "@/lib/student-copilot";
import type {
  DashboardChatMessage,
  StudentCopilotAttachment,
  StudentCopilotResponse,
  StudentCopilotSubmissionDraft,
  StudentCopilotTaskCandidate,
  StudentTaskContextPayload,
} from "@/types/student-copilot";

const INITIAL_MESSAGES: Record<string, DashboardChatMessage[]> = {
  aluno: [
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou seu copilot de estudos. Posso tirar dúvidas, revisar textos e preparar entregas de atividades com PDF para você confirmar.",
    },
  ],
  professor: [
    {
      id: "1",
      role: "assistant",
      content:
        "Olá, Professor! Estou aqui para ajudar a criar materiais didáticos, planos de aula e atividades gamificadas. O que gostaria de criar hoje?",
    },
  ],
  coordenacao: [
    {
      id: "1",
      role: "assistant",
      content:
        "Bem-vindo(a)! Posso analisar planos de aula e verificar aderência à BNCC. Selecione um plano ou me descreva o que precisa analisar.",
    },
  ],
  diretor: [
    {
      id: "1",
      role: "assistant",
      content:
        "Bom dia! Posso ajudar com gestão escolar, gerar documentos formais ou analisar indicadores. O que precisa hoje?",
    },
  ],
  secretaria: [
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Estou aqui para auxiliar na gestão administrativa. Posso ajudar a localizar informações, alocar ou alterar professores em turmas. O que deseja fazer?",
    },
  ],
};

interface SendMessageOptions {
  selectedTaskContext?: StudentTaskContextPayload | null;
  attachment?: File | null;
}

function buildStudentMessagePayload(
  content: string,
  taskContext?: StudentTaskContextPayload | null,
) {
  if (!taskContext) {
    return content;
  }

  return [
    `Contexto da tarefa selecionada pelo aluno:`,
    `- taskId: ${taskContext.taskId}`,
    `- título: ${taskContext.title}`,
    `- turma: ${taskContext.className}`,
    `- disciplina: ${taskContext.disciplineName || "Não identificada"}`,
    "",
    content,
  ].join("\n");
}

function processLegacyIntents(displayContent: string) {
  let normalizedContent = displayContent;

  const teacherIntentMatch = normalizedContent.match(
    /<intent\s+type="change_teacher"\s+class="([^"]+)"\s+teacher="([^"]+)"\s*\/>/,
  );
  if (teacherIntentMatch) {
    window.dispatchEvent(
      new CustomEvent("changeTeacherIntent", {
        detail: {
          className: teacherIntentMatch[1],
          teacherName: teacherIntentMatch[2],
        },
      }),
    );
    normalizedContent = normalizedContent.replace(teacherIntentMatch[0], "").trim();
  }

  const pddeIntentMatch = normalizedContent.match(
    /<intent\s+type="smart_pdde"\s+amount="(\d+)"\s*\/>/i,
  );
  if (pddeIntentMatch) {
    window.dispatchEvent(
      new CustomEvent("smartPddeIntent", {
        detail: { amount: parseInt(pddeIntentMatch[1], 10) },
      }),
    );
    normalizedContent = normalizedContent.replace(pddeIntentMatch[0], "").trim();
  }

  return normalizedContent;
}

async function readStructuredStream(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/event-stream")) {
    const rawText = await response.text();
    try {
      const data = JSON.parse(rawText) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar a resposta da IA.");
      }
      return data.message || rawText;
    } catch {
      if (!response.ok) {
        throw new Error(rawText || "Erro ao processar a resposta da IA.");
      }
      return rawText;
    }
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("Não foi possível ler a resposta do copilot.");
  }

  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullContent += content;
        }
      } catch {
        fullContent += jsonStr;
      }
    }
  }

  return fullContent;
}

export function useDashboardChat() {
  const { role, session, user } = useAuth();
  const { aiPersona } = useApp();
  const { toast } = useToast();
  const isStudent = role === "aluno";

  const [messages, setMessages] = useState<DashboardChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);
  const [selectedTaskContext, setSelectedTaskContext] =
    useState<StudentTaskContextPayload | null>(null);

  useEffect(() => {
    if (role) {
      setMessages(INITIAL_MESSAGES[role] || []);
    } else {
      setMessages([]);
    }

    setInput("");
    setPendingFile(null);
    setSelectedTaskContext(null);
  }, [role]);

  const appendAssistantMessage = useCallback((
    content: string,
    options?: Partial<DashboardChatMessage>,
  ) => {
    const message: DashboardChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      ...options,
    };

    setMessages((prev) => [...prev, message]);
  }, []);

  const addAIMessage = useCallback((content: string) => {
    appendAssistantMessage(content);
  }, [appendAssistantMessage]);

  const uploadStudentAttachment = useCallback(async (
    file: File,
  ): Promise<StudentCopilotAttachment> => {
    if (!user) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const safeName = sanitizeStorageFileName(file.name);
    const filePath = `${user.id}/${Date.now()}_${safeName}`;

    setIsUploadingFile(true);
    const { error } = await supabase.storage
      .from("student-submissions")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type || "application/pdf",
        upsert: false,
      });
    setIsUploadingFile(false);

    if (error) {
      throw new Error("Não foi possível anexar o PDF. Tente novamente.");
    }

    return {
      name: file.name,
      path: filePath,
      mimeType: file.type || "application/pdf",
      size: file.size,
    };
  }, [user]);

  const generatePDF = useCallback((content: string) => {
    try {
      const doc = new jsPDF();
      const cleanContent = content
        .replace(/<document>/g, "")
        .replace(/<\/document>/g, "")
        .replace(/\[DOCUMENTO\]/g, "")
        .trim();

      const splitText = doc.splitTextToSize(cleanContent, 180);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(splitText, 15, 20);
      doc.save("documento_educai.pdf");

      toast({
        title: "PDF Gerado",
        description: "O download do documento começou.",
      });
    } catch (error) {
      console.error("Error generating PDF", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível criar o arquivo PDF.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendStudentMessage = useCallback(async (
    contentToSend: string,
    contentToDisplay: string,
    options?: SendMessageOptions,
  ) => {
    if (!session?.access_token) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const attachmentFile = options?.attachment ?? pendingFile;
    let uploadedAttachment: StudentCopilotAttachment | undefined;

    if (attachmentFile) {
      uploadedAttachment = await uploadStudentAttachment(attachmentFile);
    }

    const contextTask = options?.selectedTaskContext ?? selectedTaskContext;
    const apiMessages = [...messages]
      .filter((message) => message.id !== "1")
      .map((message) => ({
        role: message.role,
        content: message.rawContent || message.content,
      }));

    const userMessage: DashboardChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: contentToDisplay,
      attachments: uploadedAttachment ? [uploadedAttachment] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingFile(null);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-copilot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey:
            import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
            import.meta.env.VITE_SUPABASE_ANON_KEY ||
            "",
        },
        body: JSON.stringify({
          messages: [
            ...apiMessages,
            {
              role: "user",
              content: buildStudentMessagePayload(contentToSend, contextTask),
            },
          ],
          context: {
            selectedTaskId: contextTask?.taskId,
            attachment: uploadedAttachment,
          },
        }),
      },
    );

    const fullContent = await readStructuredStream(response);
    const parsed = parseStudentCopilotResponse(fullContent);

    let responsePayload: StudentCopilotResponse | undefined;
    if (parsed) {
      responsePayload = {
        ...parsed,
        attachment: parsed.attachment || uploadedAttachment,
        submissionDraft: parsed.submissionDraft
          ? {
              ...parsed.submissionDraft,
              attachment:
                parsed.submissionDraft.attachment || uploadedAttachment,
              studentMessage:
                parsed.submissionDraft.studentMessage || contentToSend,
              extractedTextSnippet:
                parsed.submissionDraft.extractedTextSnippet ||
                parsed.extractedTextSnippet,
              source:
                parsed.submissionDraft.source ||
                (uploadedAttachment && contentToSend
                  ? "pdf_and_text"
                  : uploadedAttachment
                    ? "pdf"
                    : "text"),
            }
          : undefined,
      };
    }

    appendAssistantMessage(responsePayload?.message || fullContent, {
      rawContent: parsed ? fullContent : undefined,
      studentCopilot: responsePayload,
    });
  }, [
    appendAssistantMessage,
    messages,
    pendingFile,
    selectedTaskContext,
    session?.access_token,
    uploadStudentAttachment,
  ]);

  const sendLegacyMessage = useCallback(async (
    contentToSend: string,
    contentToDisplay: string,
  ) => {
    const userMessage: DashboardChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: contentToDisplay,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const apiMessages = [
      ...messages,
      { role: "user" as const, content: contentToSend, id: "temp" },
    ]
      .filter((message) => message.id !== "1")
      .map((message) => ({ role: message.role, content: message.content }));

    const { data, error } = await supabase.functions.invoke("chat-ai", {
      body: {
        messages: apiMessages,
        role,
        persona: aiPersona,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.message == null || data.message.trim() === "") {
      throw new Error("A IA retornou uma resposta vazia. Tente novamente.");
    }

    const normalizedContent = processLegacyIntents(data.message);
    appendAssistantMessage(normalizedContent, {
      isDocument:
        normalizedContent.includes("<document>") ||
        normalizedContent.includes("[DOCUMENTO]"),
    });
  }, [aiPersona, appendAssistantMessage, messages, role]);

  const handleSend = useCallback(async (
    customContent?: string,
    displayContent?: string,
    options?: SendMessageOptions,
  ) => {
    const rawInput = customContent ?? input;
    const trimmedInput = rawInput.trim();
    const attachmentFile = options?.attachment ?? pendingFile;

    if ((!trimmedInput && !attachmentFile) || isLoading) {
      return;
    }

    const contentToSend =
      trimmedInput ||
      (isStudent && attachmentFile
        ? "Analise o PDF anexado e me ajude com a entrega da atividade."
        : "");
    const contentToDisplay =
      displayContent ||
      trimmedInput ||
      (attachmentFile ? `Enviei o PDF "${attachmentFile.name}".` : "");

    setIsLoading(true);

    try {
      if (isStudent) {
        await sendStudentMessage(contentToSend, contentToDisplay, options);
      } else {
        await sendLegacyMessage(contentToSend, contentToDisplay);
      }
    } catch (error) {
      console.error("[dashboard-chat] error", error);
      const errorMessage =
        error instanceof Error ? error.message : "Falha na conexão com a IA.";

      toast({
        title: "Erro ao conectar com IA",
        description: errorMessage,
        variant: "destructive",
      });

      appendAssistantMessage(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsUploadingFile(false);
    }
  }, [
    appendAssistantMessage,
    input,
    isLoading,
    isStudent,
    pendingFile,
    sendLegacyMessage,
    sendStudentMessage,
    toast,
  ]);

  const sendUserMessage = useCallback((content: string, displayContent?: string) => {
    void handleSend(content, displayContent);
  }, [handleSend]);

  const startStudentTaskSubmission = useCallback((payload: StudentTaskContextPayload) => {
    setSelectedTaskContext(payload);

    if (payload.responseContent?.trim()) {
      void handleSend(
        `Quero entregar esta atividade com o texto abaixo.\n\n${payload.responseContent.trim()}`,
        `Enviar atividade: ${payload.title}`,
        { selectedTaskContext: payload },
      );
      return;
    }

    appendAssistantMessage(
      `Contexto da atividade "${payload.title}" preparado. Agora você pode anexar um PDF ou escrever uma mensagem para eu montar a entrega.`,
    );
  }, [appendAssistantMessage, handleSend]);

  const handleChooseStudentTask = (
    message: DashboardChatMessage,
    candidate: StudentCopilotTaskCandidate,
  ) => {
    const draftResponse = createDraftFromCandidate(
      candidate,
      message.studentCopilot?.attachment,
      message.studentCopilot?.extractedTextSnippet,
      message.studentCopilot?.submissionDraft?.studentMessage,
    );

    appendAssistantMessage(draftResponse.message, {
      studentCopilot: draftResponse,
    });

    setSelectedTaskContext({
      taskId: candidate.taskId,
      title: candidate.title,
      classId: candidate.classId,
      className: candidate.className,
      teacherId: candidate.teacherId,
      teacherName: candidate.teacherName,
      disciplineId: candidate.disciplineId,
      disciplineName: candidate.disciplineName,
    });
  };

  const handleConfirmStudentSubmission = async (
    draft: StudentCopilotSubmissionDraft,
  ) => {
    setConfirmingTaskId(draft.taskId);

    try {
      const { data, error } = await supabase.functions.invoke(
        "submit-student-task",
        {
          body: {
            draft: {
              taskId: draft.taskId,
              studentMessage: draft.studentMessage,
              confidence: draft.confidence,
              attachment: draft.attachment,
            },
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      const responsePayload: StudentCopilotResponse = {
        intent: "TASK_CONFIRMED",
        decision: "DELIVERY_COMPLETE",
        message:
          data?.message ||
          `Entreguei "${draft.title}" com sucesso. Agora o professor poderá revisar a atividade.`,
        deliveryResult: data?.deliveryResult,
      };

      appendAssistantMessage(responsePayload.message, {
        studentCopilot: responsePayload,
      });

      window.dispatchEvent(new Event("studentTaskSubmitted"));
      setSelectedTaskContext(null);
    } catch (error) {
      console.error("[dashboard-chat] confirm submission error", error);
      toast({
        title: "Erro ao enviar atividade",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setConfirmingTaskId(null);
    }
  };

  useEffect(() => {
    window.addAIMessage = addAIMessage;
    window.sendUserMessage = sendUserMessage;
    window.startStudentTaskSubmission = startStudentTaskSubmission;

    return () => {
      delete window.addAIMessage;
      delete window.sendUserMessage;
      delete window.startStudentTaskSubmission;
    };
  }, [addAIMessage, sendUserMessage, startStudentTaskSubmission]);

  return {
    isStudent,
    messages,
    input,
    setInput,
    pendingFile,
    setPendingFile,
    isLoading,
    isUploadingFile,
    confirmingTaskId,
    aiPersona,
    handleSend,
    addAIMessage,
    generatePDF,
    handleChooseStudentTask,
    handleConfirmStudentSubmission,
  };
}
