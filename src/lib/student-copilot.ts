import { jsonrepair } from "jsonrepair";
import type {
  StudentCopilotAttachment,
  StudentCopilotResponse,
  StudentCopilotTaskCandidate,
} from "@/types/student-copilot";

function extractJsonContent(rawContent: string): string | null {
  const cleanContent = rawContent.includes("```")
    ? rawContent.replace(/```json/g, "").replace(/```/g, "")
    : rawContent;

  const firstBrace = cleanContent.indexOf("{");
  const lastBrace = cleanContent.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return cleanContent.slice(firstBrace, lastBrace + 1);
}

export function parseStudentCopilotResponse(
  rawContent: string,
): StudentCopilotResponse | null {
  const jsonContent = extractJsonContent(rawContent);

  if (!jsonContent) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonContent) as StudentCopilotResponse;
    if (!parsed.intent || !parsed.decision || typeof parsed.message !== "string") {
      return null;
    }
    return parsed;
  } catch (error) {
    try {
      const repairedJson = jsonrepair(jsonContent);
      const parsed = JSON.parse(repairedJson) as StudentCopilotResponse;
      if (!parsed.intent || !parsed.decision || typeof parsed.message !== "string") {
        return null;
      }
      return parsed;
    } catch {
      console.error("Unable to parse student copilot response", error);
      return null;
    }
  }
}

export function sanitizeStorageFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function createDraftFromCandidate(
  candidate: StudentCopilotTaskCandidate,
  attachment: StudentCopilotAttachment | undefined,
  extractedTextSnippet: string | undefined,
  studentMessage: string | undefined,
): StudentCopilotResponse {
  return {
    intent: "TASK_DELIVERY",
    decision: "REQUEST_CONFIRMATION",
    message: `Preparei a entrega para "${candidate.title}". Revise os dados e confirme quando quiser enviar.`,
    attachment,
    extractedTextSnippet,
    submissionDraft: {
      taskId: candidate.taskId,
      title: candidate.title,
      classId: candidate.classId,
      className: candidate.className,
      teacherId: candidate.teacherId,
      teacherName: candidate.teacherName,
      disciplineId: candidate.disciplineId,
      disciplineName: candidate.disciplineName,
      dueDate: candidate.dueDate,
      confidence: candidate.confidence,
      requiresConfirmation: true,
      source: attachment && studentMessage ? "pdf_and_text" : attachment ? "pdf" : "text",
      attachment,
      extractedTextSnippet,
      studentMessage,
    },
  };
}

export function formatConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "Alta";
  if (confidence >= 0.7) return "Boa";
  if (confidence >= 0.5) return "Média";
  return "Baixa";
}
