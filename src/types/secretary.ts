export interface SecretaryStats {
  students: {
    total: number;
    active: number;
  };
  teachers: {
    total: number;
    active: number;
  };
  classes: number;
  boletos: {
    pending: number;
    overdue: number;
  };
}

export interface GeneratedCredentials {
  cpf: string;
  password: string;
  name: string;
  type: "aluno" | "professor";
}

export interface CredentialsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: GeneratedCredentials | null;
  onCopy: (text: string, type: "cpf" | "password") => void;
  copiedState: "cpf" | "password" | null;
}
