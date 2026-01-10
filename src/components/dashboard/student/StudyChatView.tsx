import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, ClipboardList, BookOpen, Target, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import type { StudyObjective } from './ObjectiveSelectionView';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface StudyChatViewProps {
  objective: StudyObjective;
  onBack: () => void;
}

const OBJECTIVE_CONFIG = {
  diagnostic: {
    title: 'Diagnóstico Rápido',
    icon: ClipboardList,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    initialMessage: 'Olá! 👋 Vou fazer um diagnóstico rápido para entender seu nível. Sobre qual assunto você gostaria de ser avaliado? Pode ser matemática, português, ciências, história ou qualquer outro tema!',
  },
  concept: {
    title: 'Entender Conceito',
    icon: BookOpen,
    color: 'text-success',
    bgColor: 'bg-success/10',
    initialMessage: 'Olá! 📚 Estou aqui para te ajudar a entender qualquer conceito passo-a-passo. Qual assunto você gostaria de aprender hoje? Pode perguntar qualquer coisa!',
  },
  practice: {
    title: 'Praticar',
    icon: Target,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    initialMessage: 'Olá! 🎯 Vamos praticar juntos! Escolha um tema e vou criar exercícios curtos com feedback imediato para você. Qual assunto você quer praticar?',
  },
  review: {
    title: 'Revisão',
    icon: RefreshCw,
    color: 'text-primary',
    bgColor: 'bg-secondary',
    initialMessage: 'Olá! 🔄 Vamos revisar o que você já aprendeu para não esquecer! Qual assunto você gostaria de revisar? Vou te ajudar a relembrar os pontos chave.',
  },
};

export function StudyChatView({ objective, onBack }: StudyChatViewProps) {
  const config = OBJECTIVE_CONFIG[objective];
  const Icon = config.icon;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: config.initialMessage,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('chat-ai', {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          role: 'aluno',
          context: {
            objective: objective,
            objectiveTitle: config.title,
          },
        },
      });

      if (response.error) throw new Error(response.error.message);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente!',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h1 className="font-bold">{config.title}</h1>
            <p className="text-sm text-muted-foreground">Chat com IA</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className={message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                  {message.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : 'EU'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="pt-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
