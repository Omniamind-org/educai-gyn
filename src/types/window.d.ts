import type { StudentTaskContextPayload } from "@/types/student-copilot";

declare global {
  interface Window {
    addAIMessage?: (content: string) => void;
    sendUserMessage?: (content: string, displayContent?: string) => void;
    openAIChat?: () => void;
    startStudentTaskSubmission?: (payload: StudentTaskContextPayload) => void;
  }
}

export {};
