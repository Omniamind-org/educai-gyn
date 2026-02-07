import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { SecretaryService } from "@/services/secretary.service";
import { SecretaryStats, GeneratedCredentials } from "@/types/secretary";

export function useSecretaryDashboard() {
  const { toast } = useToast();
  
  const [stats, setStats] = useState<SecretaryStats>({
    students: { total: 0, active: 0 },
    teachers: { total: 0, active: 0 },
    classes: 0,
    boletos: { pending: 0, overdue: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [newCredentials, setNewCredentials] = useState<GeneratedCredentials | null>(null);
  const [copied, setCopied] = useState<"cpf" | "password" | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SecretaryService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching secretary stats:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas do painel."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Format CPF for display
  const formatCpf = (cpf: string): string => {
    const clean = cpf.replace(/\D/g, "");
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleCredentialsCreated = (creds: GeneratedCredentials) => {
    setNewCredentials({
      cpf: formatCpf(creds.cpf),
      password: creds.password,
      name: creds.name,
      type: creds.type
    });
    setShowCredentials(true);
    fetchStats(); // Refresh stats when new entity is added
  };

  const copyToClipboard = async (text: string, type: "cpf" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copiado!",
      description: `${type === "cpf" ? "CPF" : "Senha"} copiado para a área de transferência.`
    });
  };

  return {
    stats,
    loading,
    showCredentials,
    setShowCredentials,
    newCredentials,
    copied,
    handleCredentialsCreated,
    copyToClipboard
  };
}
