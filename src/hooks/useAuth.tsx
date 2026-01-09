import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'aluno' | 'professor' | 'coordenacao' | 'diretor' | 'secretaria';

type SignInResult = { error: Error | null };

type SignUpResult = { error: Error | null };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_BY_EMAIL: Record<string, AppRole> = {
  'aluno@gmail.com': 'aluno',
  'professor@gmail.com': 'professor',
  'coordenacao@gmail.com': 'coordenacao',
  'diretor@gmail.com': 'diretor',
  'secretaria@gmail.com': 'secretaria',
};

function deriveRoleFromEmail(email?: string | null): AppRole | null {
  if (!email) return null;
  return ROLE_BY_EMAIL[email.toLowerCase()] ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return (data?.role as AppRole | null) ?? null;
  };

  const ensureUserRole = async (u: User) => {
    const existing = await fetchUserRole(u.id);
    if (existing) return existing;

    const derived = deriveRoleFromEmail(u.email);
    if (!derived) return null;

    // Try to insert (policy only allows role mapped from JWT email)
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: u.id, role: derived });

    // Ignore errors (e.g., if it was created in parallel)
    if (insertError) {
      // no console.log of sensitive data
    }

    return await fetchUserRole(u.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          const ensuredRole = await ensureUserRole(session.user);
          setRole(ensuredRole);
          setLoading(false);
        }, 0);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        ensureUserRole(session.user).then((ensuredRole) => {
          setRole(ensuredRole);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    const derivedRole = deriveRoleFromEmail(email);
    if (!derivedRole) {
      const error = new Error('Email não permitido para cadastro de teste.');
      toast({
        title: 'Cadastro indisponível',
        description: 'Use um dos emails de teste (aluno/professor/coordenacao/diretor).',
        variant: 'destructive',
      });
      return { error };
    }

    const redirectUrl = `${window.location.origin}/auth`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    if (data.user) {
      // Ensure role row exists (RLS allows only mapped role)
      await supabase.from('user_roles').insert({ user_id: data.user.id, role: derivedRole });
      setRole(derivedRole);
    }

    toast({
      title: 'Conta criada!',
      description: 'Você já pode entrar com seu email e senha.',
    });

    return { error: null };
  };

  const signOut = async () => {
    try {
      // Use local sign-out to guarantee local session cleanup even if the server session is already gone
      await supabase.auth.signOut({ scope: 'local' });
    } finally {
      setUser(null);
      setSession(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
