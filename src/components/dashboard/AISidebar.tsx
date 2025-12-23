import { useState, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
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
      role: 'ai',
      content: 'Olá! 👋 Sou seu assistente de estudos. Vi que você tem algumas atividades pendentes. Posso te ajudar com a redação ou matemática?',
    },
  ],
  professor: [
    {
      id: '1',
      role: 'ai',
      content: 'Olá, Professor! 📚 Estou aqui para ajudar a criar materiais didáticos personalizados. Que tal começarmos com um plano de aula?',
    },
  ],
  coordenacao: [
    {
      id: '1',
      role: 'ai',
      content: 'Bem-vindo(a)! 📋 Posso analisar planos de aula e verificar aderência à BNCC. Selecione um plano para começar a análise.',
    },
  ],
  diretor: [
    {
      id: '1',
      role: 'ai',
      content: 'Bom dia! 🏫 Estou pronto para ajudar com gestão escolar. Posso gerar relatórios, documentos ou analisar indicadores financeiros.',
    },
  ],
};

export function AISidebar() {
  const { currentRole, aiPersona, setAiPersona } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (currentRole) {
      setMessages(INITIAL_MESSAGES[currentRole] || []);
    }
  }, [currentRole]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: 'Entendi! Estou processando sua solicitação. Em breve terei uma resposta personalizada para você.',
    };

    setMessages((prev) => [...prev, userMessage, aiResponse]);
    setInput('');
  };

  const addAIMessage = (content: string) => {
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
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
            <p className="text-xs text-muted-foreground">Sempre aqui para ajudar</p>
          </div>
        </div>

        {/* Persona Selector (only for professors) */}
        {currentRole === 'professor' && (
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
              'flex opacity-0 animate-fade-in',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                'chat-bubble',
                message.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'
              )}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}