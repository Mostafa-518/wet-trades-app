
import React, { createContext, useContext } from 'react';
import { useResponsibilities } from '@/hooks/useResponsibilities';
import { Responsibility } from '@/types/responsibility';

interface ResponsibilityContextType {
  responsibilities: Responsibility[];
  addResponsibility: (data: Partial<Responsibility>) => Promise<void>;
  updateResponsibility: (id: string, data: Partial<Responsibility>) => Promise<void>;
  deleteResponsibility: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ResponsibilityContext = createContext<ResponsibilityContextType | undefined>(undefined);

export function ResponsibilityProvider({ children }: { children: React.ReactNode }) {
  const {
    responsibilities,
    addResponsibility,
    updateResponsibility,
    deleteResponsibility,
    isLoading
  } = useResponsibilities();

  const value: ResponsibilityContextType = {
    responsibilities: responsibilities || [],
    addResponsibility,
    updateResponsibility,
    deleteResponsibility,
    isLoading
  };

  return (
    <ResponsibilityContext.Provider value={value}>
      {children}
    </ResponsibilityContext.Provider>
  );
}

export function useResponsibilityContext() {
  const context = useContext(ResponsibilityContext);
  if (context === undefined) {
    throw new Error('useResponsibilityContext must be used within a ResponsibilityProvider');
  }
  return context;
}
