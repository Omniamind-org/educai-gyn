import { useState, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { STUDENT_CONTEXT } from '@/data/studentData';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const PERSONAS = [
  { id: 'padrao', label: 'Padrão' },
  { id: 'cora', label: 'Cora Coralina (Regional)' },
  { id: 'cientista', label: 'Cientista' },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  aluno: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente de estudos com IA. Posso ajudar com suas atividades, tirar dúvidas ou revisar seus textos. Como posso ajudar?',
    },
  ],
  professor: [
    {
      id: '1',
      role: 'assistant',
      content: 'Olá, Professor! 📚 Estou aqui para ajudar a criar materiais didáticos, planos de aula e atividades gamificadas. O que gostaria de criar hoje?',
    },
  ],
  coordenacao: [
    {
      id: '1',
      role: 'assistant',
      content: 'Bem-vindo(a)! 📋 Posso analisar planos de aula e verificar aderência à BNCC. Selecione um plano ou me descreva o que precisa analisar.',
    },
  ],
  diretor: [
    {
      id: '1',
      role: 'assistant',
      content: 'Bom dia! 🏫 Posso ajudar com gestão escolar, gerar documentos formais ou analisar indicadores. O que precisa hoje?',
    },
  ],
};

export function AISidebar() {
  const { role } = useAuth();
  const { aiPersona, setAiPersona } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (role) {
      setMessages(INITIAL_MESSAGES[role] || []);
    }
  }, [role]);

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
      // Prepare messages for API (excluding initial greeting)
      const apiMessages = [...messages, userMessage]
        .filter(m => m.id !== '1') // Remove initial greeting
        .map(m => ({ role: m.role, content: m.content }));

      // Build context based on role - use centralized student data
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

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const addAIMessage = (content: string) => {
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  // Expose addAIMessage to window for external triggers
  useEffect(() => {
    (window as any).addAIMessage = addAIMessage;
    return () => {
      delete (window as any).addAIMessage;
    };
  }, []);

  return (
    <aside className="ai-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">IA Assistente</h2>
            <p className="text-xs text-muted-foreground">Powered by GPT-5 Mini</p>
          </div>
        </div>

        {/* Persona Selector (only for professors) */}
        {role === 'professor' && (
          <Select value={aiPersona} onValueChange={setAiPersona}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Definir Persona" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map((persona) => (
                <SelectItem key={persona.id} value={persona.label}>
                  {persona.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

      {/* Input Area */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
