import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { BookOpen, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppRole = "aluno" | "professor" | "coordenacao" | "diretor" | "secretaria";

type DemoCreds = { email: string; password: string };

const DEMO_CREDENTIALS: Record<Exclude<AppRole, "aluno">, DemoCreds> = {
  professor: { email: "professor@gmail.com", password: "123456789" },
  coordenacao: { email: "coordenacao@gmail.com", password: "123456789" },
  diretor: { email: "diretor@gmail.com", password: "123456789" },
  secretaria: { email: "secretaria@gmail.com", password: "123456789" },
};

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const cpfLoginSchema = z.object({
  cpf: z.string().refine((v) => v.replace(/\D/g, "").length === 11, "CPF deve ter 11 dígitos"),
  password: z.string().min(1, "Senha é obrigatória"),
});

function isAppRole(v: string | null): v is AppRole {
  return v === "aluno" || v === "professor" || v === "coordenacao" || v === "diretor" || v === "secretaria";
}

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, loading, signIn } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prefillRole = useMemo(() => {
    const r = searchParams.get("role");
    return isAppRole(r) ? r : null;
  }, [searchParams]);

  // Default tab based on role
  const defaultTab = prefillRole === "aluno" ? "aluno" : "funcionario";

  // Staff login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Student (CPF) login form state
  const [cpf, setCpf] = useState("");
  const [cpfPassword, setCpfPassword] = useState("");
  const [cpfErrors, setCpfErrors] = useState<{ cpf?: string; password?: string }>({});

  useEffect(() => {
    if (!loading && user && role) {
      navigate("/app");
    }
  }, [user, role, loading, navigate]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});

    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setLoginErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (!error) {
      navigate("/app");
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpfErrors({});

    const result = cpfLoginSchema.safeParse({ cpf, password: cpfPassword });
    if (!result.success) {
      const fieldErrors: { cpf?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "cpf") fieldErrors.cpf = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setCpfErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke("login-student", {
        body: { cpf, password: cpfPassword },
      });

      // Handle errors from edge function (including 401)
      if (response.error) {
        // Try to get message from response.data (edge function returns JSON body even on error)
        const errorMessage = response.data?.error || "CPF ou senha incorretos";
        toast({
          title: "Erro ao fazer login",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const data = response.data;

      if (!data.success) {
        toast({
          title: "Erro ao fazer login",
          description: data.error || "CPF ou senha incorretos",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Set session manually
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao Aprendu.",
      });

      navigate("/app");
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "CPF ou senha incorretos",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format CPF as user types
  const handleCpfChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "").slice(0, 11);
    // Format: 000.000.000-00
    let formatted = digits;
    if (digits.length > 3) {
      formatted = digits.slice(0, 3) + "." + digits.slice(3);
    }
    if (digits.length > 6) {
      formatted = formatted.slice(0, 7) + "." + digits.slice(6);
    }
    if (digits.length > 9) {
      formatted = formatted.slice(0, 11) + "-" + digits.slice(9);
    }
    setCpf(formatted);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-primary">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Aprendu</CardTitle>
          <CardDescription>Entre para acessar sua área</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="aluno" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Aluno
              </TabsTrigger>
              <TabsTrigger value="funcionario" className="gap-2">
                <User className="h-4 w-4" />
                Funcionário
              </TabsTrigger>
            </TabsList>

            {/* Student Login with CPF */}
            <TabsContent value="aluno">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {cpfErrors.cpf && <p className="text-sm text-destructive">{cpfErrors.cpf}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf-password">Senha</Label>
                  <Input
                    id="cpf-password"
                    type="password"
                    placeholder="Senha fornecida pela secretaria"
                    value={cpfPassword}
                    onChange={(e) => setCpfPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {cpfErrors.password && <p className="text-sm text-destructive">{cpfErrors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar como Aluno"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Sua senha foi fornecida pela secretaria da escola
                </p>

                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/")}>
                  Voltar
                </Button>
              </form>
            </TabsContent>

            {/* Staff Login with Email */}
            <TabsContent value="funcionario">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {loginErrors.email && <p className="text-sm text-destructive">{loginErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Use as credenciais de teste:<br />
                  professor@gmail.com / coordenacao@gmail.com / diretor@gmail.com / secretaria@gmail.com<br />
                  Senha: 123456789
                </p>

                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/")}>
                  Voltar
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
