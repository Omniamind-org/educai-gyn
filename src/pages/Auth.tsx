import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "aluno" | "professor" | "coordenacao" | "diretor" | "secretaria";

type DemoCreds = { email: string; password: string };

const DEMO_CREDENTIALS: Record<AppRole, DemoCreds> = {
  aluno: { email: "aluno@gmail.com", password: "123456789" },
  professor: { email: "professor@gmail.com", password: "123456789" },
  coordenacao: { email: "coordenacao@gmail.com", password: "123456789" },
  diretor: { email: "diretor@gmail.com", password: "123456789" },
  secretaria: { email: "secretaria@gmail.com", password: "123456789" },
};

const allowedEmails = Object.values(DEMO_CREDENTIALS).map((c) => c.email.toLowerCase());

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .refine((v) => allowedEmails.includes(v.toLowerCase()), {
      message: "Use um email de teste (aluno/professor/coordenacao/diretor/secretaria).",
    }),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

function isAppRole(v: string | null): v is AppRole {
  return v === "aluno" || v === "professor" || v === "coordenacao" || v === "diretor" || v === "secretaria";
}

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, loading, signIn, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prefillRole = useMemo(() => {
    const r = searchParams.get("role");
    return isAppRole(r) ? r : null;
  }, [searchParams]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!loading && user && role) {
      navigate("/app");
    }
  }, [user, role, loading, navigate]);

  // Role from URL is available but we don't pre-fill credentials anymore

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});

    const result = signupSchema.safeParse({ email: signupEmail, password: signupPassword });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setSignupErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword);
    setIsSubmitting(false);

    if (!error) {
      navigate("/app");
    }
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
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar (teste)</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
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
                  />
                  {loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/")}>
                  Voltar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email (somente contas de teste)</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="aluno@gmail.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use: aluno@gmail.com, professor@gmail.com, coordenacao@gmail.com, diretor@gmail.com ou secretaria@gmail.com
                  </p>
                  {signupErrors.email && <p className="text-sm text-destructive">{signupErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="123456789"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  {signupErrors.password && <p className="text-sm text-destructive">{signupErrors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
