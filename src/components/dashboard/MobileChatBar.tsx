import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Settings, Mic, Loader2, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { STUDENT_CONTEXT } from '@/data/studentData';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  aluno: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente de estudos com IA. Como posso ajudar?',
    },
  ],
  professor: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá, Professor! 📚 Estou aqui para ajudar com materiais didáticos e atividades.',
    },
  ],
  coordenacao: [
    {
      id: '1',
      role: 'assistant',
      content: 'Bem-vindo(a)! 📋 Posso analisar planos de aula e verificar aderência à BNCC.',
    },
  ],
  diretor: [
    {
      id: '1',
      role: 'assistant',
      content: 'Bom dia! 🏫 Posso ajudar com gestão escolar e gerar documentos formais.',
    },
  ],
  secretaria: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 📝 Posso ajudar com documentos e gestão administrativa.',
    },
  ],
};

export function MobileChatBar() {
  const { role } = useAuth();
  const { aiPersona } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role) {
      setMessages(INITIAL_MESSAGES[role] || []);
    }
  }, [role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage]
        .filter(m => m.id !== '1')
        .map(m => ({ role: m.role, content: m.content }));

      const context = role === 'aluno' ? STUDENT_CONTEXT : undefined;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          messages: apiMessages,
          role: role,
          persona: aiPersona,
          context,
        },
      });

      if (error) {
        if (error.message?.includes('401') || error.message?.includes('Invalid JWT')) {
          toast({
            title: 'Sessão expirada',
            description: 'Por favor, faça login novamente.',
            variant: 'destructive',
          });
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch {
            // ignore
          }
          return;
        }
        throw new Error(error.message);
      }

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling AI:', error);
      toast({
        title: 'Erro ao conectar com IA',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro. Tente novamente.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Expanded Chat View */}
      {isExpanded && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Aprendu IA</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                  index === messages.length - 1 && 'animate-fade-in'
                )}
              >
                <div
                  className={cn(
                    'chat-bubble',
                    message.role === 'assistant' ? 'chat-bubble-ai' : 'chat-bubble-user'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="chat-bubble chat-bubble-ai flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input in Expanded View */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte ao Aprendu"
                className="flex-1 bg-muted border-0"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
                autoFocus
              />
              <Button 
                size="icon" 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Chat Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-secondary border-t border-border rounded-t-2xl p-3 pb-safe shadow-lg",
        isExpanded && "hidden"
      )}>
        {/* Input Row */}
        <div 
          className="bg-muted-foreground/20 rounded-xl px-4 py-3 mb-2 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <span className="text-muted-foreground text-sm">Pergunte ao Aprendu</span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              className="h-9 w-9"
              onClick={() => setIsExpanded(true)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
