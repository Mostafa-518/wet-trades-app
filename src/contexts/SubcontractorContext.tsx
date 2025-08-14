
import React, { createContext, useContext } from 'react';
import { useSubcontractors } from '@/hooks/useSubcontractors';
import { Subcontractor, SubcontractorFormData } from '@/types/subcontractor';

interface SubcontractorContextType {
  subcontractors: Subcontractor[];
  addSubcontractor: (data: SubcontractorFormData) => Promise<void>;
  updateSubcontractor: (id: string, data: SubcontractorFormData) => Promise<void>;
  deleteSubcontractor: (id: string) => Promise<void>;
  isLoading: boolean;
}

const SubcontractorContext = createContext<SubcontractorContextType | undefined>(undefined);

export function SubcontractorProvider({ children }: { children: React.ReactNode }) {
  const {
    subcontractors,
    addSubcontractor,
    updateSubcontractor,
    deleteSubcontractor,
    isLoading
  } = useSubcontractors();

  const value: SubcontractorContextType = {
    subcontractors: subcontractors || [],
    addSubcontractor,
    updateSubcontractor,
    deleteSubcontractor,
    isLoading
  };

  return (
    <SubcontractorContext.Provider value={value}>
      {children}
    </SubcontractorContext.Provider>
  );
}

export function useSubcontractorContext() {
  const context = useContext(SubcontractorContext);
  if (context === undefined) {
    throw new Error('useSubcontractorContext must be used within a SubcontractorProvider');
  }
  return context;
}
