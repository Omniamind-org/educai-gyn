import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  aiPersona: string;
  setAiPersona: (persona: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [aiPersona, setAiPersona] = useState<string>('Padrão');

  return <AppContext.Provider value={{ aiPersona, setAiPersona }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
