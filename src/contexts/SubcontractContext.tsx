
import React, { createContext, useContext } from 'react';
import { useSubcontracts } from '@/hooks/useSubcontracts';
import { Subcontract } from '@/types/subcontract';
import { useProjectContext } from './ProjectContext';
import { useTradeContext } from './TradeContext';
import { useResponsibilityContext } from './ResponsibilityContext';

interface SubcontractContextType {
  subcontracts: Subcontract[];
  addSubcontract: (data: Partial<Subcontract>) => Promise<void>;
  updateSubcontract: (id: string, data: Partial<Subcontract>) => Promise<void>;
  deleteSubcontract: (id: string) => Promise<void>;
  deleteManySubcontracts: (ids: string[]) => Promise<void>;
  isLoading: boolean;
}

const SubcontractContext = createContext<SubcontractContextType | undefined>(undefined);

export function SubcontractProvider({ children }: { children: React.ReactNode }) {
  const { projects, isLoading: projectsLoading } = useProjectContext();
  const { trades, tradeItems, isLoading: tradesLoading } = useTradeContext();
  const { responsibilities, isLoading: responsibilitiesLoading } = useResponsibilityContext();

  const dependenciesReady = !tradesLoading && !responsibilitiesLoading && !projectsLoading;
  
  const {
    subcontracts,
    addSubcontract,
    updateSubcontract,
    deleteSubcontract,
    deleteManySubcontracts,
    isLoading: subcontractsLoading
  } = useSubcontracts(
    dependenciesReady ? trades : [],
    dependenciesReady ? tradeItems : [],
    dependenciesReady ? responsibilities : [],
    dependenciesReady ? projects : []
  );

  const isLoading = projectsLoading || tradesLoading || responsibilitiesLoading || subcontractsLoading;

  const value: SubcontractContextType = {
    subcontracts: subcontracts || [],
    addSubcontract,
    updateSubcontract,
    deleteSubcontract,
    deleteManySubcontracts,
    isLoading
  };

  return (
    <SubcontractContext.Provider value={value}>
      {children}
    </SubcontractContext.Provider>
  );
}

export function useSubcontractContext() {
  const context = useContext(SubcontractContext);
  if (context === undefined) {
    throw new Error('useSubcontractContext must be used within a SubcontractProvider');
  }
  return context;
}
