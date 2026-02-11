import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckCircle, Copy } from "lucide-react";
import { GeneratedCredentials } from "@/types/secretary";

interface CredentialsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: GeneratedCredentials | null;
  onCopy: (text: string, type: "cpf" | "password") => void;
  copiedState: "cpf" | "password" | null;
}

export function CredentialsDialog({ 
  isOpen, 
  onOpenChange, 
  credentials, 
  onCopy, 
  copiedState 
}: CredentialsDialogProps) {
  if (!credentials) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Credenciais Geradas</DialogTitle>
          <DialogDescription>
            Entregue estas credenciais ao {credentials.type}: <strong>{credentials.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              CPF (Login)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={credentials.cpf || ""}
                className="font-mono bg-muted"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => onCopy(credentials.cpf, "cpf")}
              >
                {copiedState === "cpf" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Senha Provisória
            </label>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={credentials.password || ""}
                className="font-mono bg-muted"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => onCopy(credentials.password, "password")}
              >
                {copiedState === "password" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Esta senha é temporária e deve ser alterada no primeiro acesso.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
