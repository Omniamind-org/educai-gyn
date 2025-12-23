import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/types/roles';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  aiPersona: string;
  setAiPersona: (persona: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [aiPersona, setAiPersona] = useState<string>('Padrão');

  return (
    <AppContext.Provider value={{ currentRole, setCurrentRole, aiPersona, setAiPersona }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}