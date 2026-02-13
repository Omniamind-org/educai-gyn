import { useState, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { STUDENT_CONTEXT } from '@/data/studentData';
import { jsPDF } from "jspdf";

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  isDocument?: boolean;
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

  const handleSend = async (customContent?: string, displayContent?: string) => {
    const contentToSend = customContent || input;
    const contentToDisplay = displayContent || contentToSend;

    if (!contentToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToDisplay,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare messages for API (excluding initial greeting)
      // Note: We use contentToDisplay for history consistency, but for the LAST message we must use the hidden prompt (contentToSend)
      // However, usually API expects the conversation history to match what "sent". 
      // If we only show "Ata", but send "Generate Ata...", the API concept of history might get confused if we push "Ata" to history but sent "Generate Ata".
      // Actually, standard practice for these hidden system/user prompts is to treat them as the user message for the API context, 
      // but usually the history is what the user *sees*. 
      // Let's create a temporary message object for the API call that replaces the last message content.

      const messagesForApi = messages.map(m => ({ role: m.role, content: m.content }));
      // Add the current message with the ACTUAL prompt content, not the display content
      messagesForApi.push({ role: 'user', content: contentToSend });

      // Remove initial greeting if it's there (id '1') - wait, mapped array lost IDs.
      // Re-doing logic closer to original but safer.
      const apiMessages = [...messages, { role: 'user' as const, content: contentToSend, id: 'temp' }]
        .filter(m => m.id !== '1')
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

      const getErrorMsg = (): string => {
        if (data?.error && typeof data.error === 'string') return data.error;
        if (data?.error && typeof data.error === 'object' && (data.error as { message?: string }).message) return (data.error as { message: string }).message;
        if (error && typeof error === 'object') {
          const err = error as { message?: string; context?: { body?: { error?: string } }; status?: number };
          if (err.context?.body?.error) return String(err.context.body.error);
          if (err.message) return err.message;
          if (err.status) return `Erro HTTP ${err.status}`;
        }
        return 'Falha na conexão. Confira se OPENAI_API_KEY está configurada no Supabase (Settings > Edge Functions > Secrets) e se a função chat-ai foi deployada.';
      };

      if (error) {
        const errStr = typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: string }).message) : String(error);
        if (errStr.includes('401') || errStr.includes('Invalid JWT') || errStr.includes('Unauthorized')) {
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
          throw new Error('Sessão expirada');
        }
        throw new Error(getErrorMsg());
      }

      if (!data?.message) {
        throw new Error(getErrorMsg());
      }

      const isDocument = data.message.includes('<document>') || data.message.includes('[DOCUMENTO]');

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        isDocument
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (e) {
      console.error('Error calling AI:', e);
      let errMsg = 'Falha na conexão com a IA.';
      if (e instanceof Error && e.message) errMsg = e.message;
      else if (e && typeof e === 'object' && 'message' in e) errMsg = String((e as { message: unknown }).message);
      else if (typeof e === 'string') errMsg = e;
      toast({
        title: 'Erro ao conectar com IA',
        description: errMsg,
        variant: 'destructive',
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Erro: ${errMsg}\n\nTente novamente ou reduza o tamanho do texto.`,
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

  const sendUserMessage = (content: string, displayContent?: string) => {
    handleSend(content, displayContent);
  }

  // Expose addAIMessage and sendUserMessage to window for external triggers
  useEffect(() => {
    (window as any).addAIMessage = addAIMessage;
    (window as any).sendUserMessage = sendUserMessage;
    return () => {
      delete (window as any).addAIMessage;
      delete (window as any).sendUserMessage;
    };
  }, [messages, role, aiPersona]);

  const generatePDF = (content: string) => {
    try {
      const doc = new jsPDF();

      // Clean up tags if present
      const cleanContent = content
        .replace(/<document>/g, '')
        .replace(/<\/document>/g, '')
        .replace(/\[DOCUMENTO\]/g, '')
        .trim();

      // Split text to fit page
      const splitText = doc.splitTextToSize(cleanContent, 180);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(splitText, 15, 20);

      doc.save("documento_educai.pdf");

      toast({
        title: "PDF Gerado!",
        description: "O download do seu documento começou.",
        className: "bg-green-500 text-white"
      });
    } catch (e) {
      console.error("Error generating PDF", e);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível criar o arquivo PDF.",
        variant: "destructive"
      });
    }
  };

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
            <p className="text-xs text-muted-foreground">Powered by GPT-5 Nano</p>
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
                message.role === 'assistant' ? 'chat-bubble-ai' : 'chat-bubble-user',
                'flex flex-col gap-2'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.role === 'assistant' && (message.isDocument || message.content.includes('[DOCUMENTO]') || message.content.includes('<document>')) && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2 gap-2 bg-white/20 hover:bg-white/30 text-inherit border-0"
                  onClick={() => generatePDF(message.content)}
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
              )}
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
          <Button size="icon" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
