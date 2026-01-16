import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage, DashboardConfig, EduGovResponseV2 } from '@/types/dashboard';

interface IntelligentCopilotProps {
  isOpen: boolean;
  onToggle: () => void;
  onDashboardGenerated: (dashboard: DashboardConfig) => void;
  onDashboardUpdate: (patches: any[]) => void;
}

export function IntelligentCopilot({ 
  isOpen, 
  onToggle, 
  onDashboardGenerated,
  onDashboardUpdate 
}: IntelligentCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Gestão Regional conectada.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { 
      id: Date.now().toString(),
      role: 'user', 
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edugov-copilot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
              { role: 'user', content: input.trim() }
            ])
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
            }
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      }

      // Try to parse as EduGovResponseV2
      let assistantMessage = '';
      let generatedDashboard: DashboardConfig | null = null;

      try {
        // Try to extract JSON from the response
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as EduGovResponseV2;
          assistantMessage = parsed.message;
          
          if (parsed.decision === 'CREATE_DASHBOARD' && parsed.dashboard) {
            generatedDashboard = parsed.dashboard;
            onDashboardGenerated(parsed.dashboard);
          } else if (parsed.decision === 'UPDATE_DASHBOARD' && parsed.patch) {
            onDashboardUpdate(parsed.patch);
          }
        } else {
          // Fallback to plain text
          assistantMessage = fullContent;
        }
      } catch {
        // Not JSON, use as plain text
        assistantMessage = fullContent;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        dashboardId: generatedDashboard?.id,
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      'fixed right-0 top-0 h-screen bg-card border-l border-border/50 shadow-xl transition-all duration-300 z-50 flex flex-col',
      isOpen ? 'w-80' : 'w-0 overflow-hidden'
    )}>
      {isOpen && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">EduGov Copilot</h3>
                <p className="text-[10px] text-primary uppercase tracking-wider">Enterprise Intelligence</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-xl px-3 py-2 text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      )}
                    >
                      {message.content}
                    </div>
                    <span className={cn(
                      'text-[10px] text-muted-foreground',
                      message.role === 'user' ? 'text-right' : 'text-left'
                    )}>
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Analisando...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ex: Compare a performance..."
                disabled={isLoading}
                className="flex-1 text-sm h-9 bg-muted/50 border-border/50"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()} 
                size="icon"
                className="h-9 w-9"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Collapsed toggle */}
      {!isOpen && (
        <Button
          variant="default"
          size="icon"
          className="fixed right-4 bottom-4 h-12 w-12 rounded-full shadow-lg z-50"
          onClick={onToggle}
        >
          <Sparkles className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
