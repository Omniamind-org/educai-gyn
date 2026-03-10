export interface StudentCopilotAttachment {
  name: string;
  path: string;
  mimeType: string;
  size: number;
}

export interface StudentCopilotTaskCandidate {
  taskId: string;
  title: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  disciplineId: string | null;
  disciplineName: string | null;
  dueDate: string | null;
  confidence: number;
  reason: string;
}

export interface StudentCopilotSubmissionDraft {
  taskId: string;
  title: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  disciplineId: string | null;
  disciplineName: string | null;
  dueDate: string | null;
  confidence: number;
  requiresConfirmation: boolean;
  source: "text" | "pdf" | "pdf_and_text";
  attachment?: StudentCopilotAttachment;
  extractedText?: string;
  extractedTextSnippet?: string;
  studentMessage?: string;
}

export interface StudentCopilotDeliveryResult {
  submissionId: string;
  taskId: string;
  submittedAt: string;
  status: "submitted";
}

export type StudentCopilotIntent =
  | "GENERAL_SUPPORT"
  | "TASK_DELIVERY"
  | "TASK_SELECTION"
  | "TASK_CONFIRMED"
  | "ERROR";

export type StudentCopilotDecision =
  | "NO_ACTION"
  | "REQUEST_TASK_SELECTION"
  | "REQUEST_CONFIRMATION"
  | "DELIVERY_COMPLETE";

export interface StudentCopilotResponse {
  intent: StudentCopilotIntent;
  decision: StudentCopilotDecision;
  message: string;
  notes?: string[];
  attachment?: StudentCopilotAttachment;
  extractedTextSnippet?: string;
  candidateTasks?: StudentCopilotTaskCandidate[];
  submissionDraft?: StudentCopilotSubmissionDraft;
  deliveryResult?: StudentCopilotDeliveryResult;
}

export interface DashboardChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  rawContent?: string;
  isDocument?: boolean;
  attachments?: StudentCopilotAttachment[];
  studentCopilot?: StudentCopilotResponse;
}

export interface StudentTaskContextPayload {
  taskId: string;
  title: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  disciplineId: string | null;
  disciplineName: string | null;
  attachmentUrl?: string | null;
  responseContent?: string;
}
