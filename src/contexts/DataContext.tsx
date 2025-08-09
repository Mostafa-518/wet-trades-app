
import React, { createContext, useContext } from 'react';
import { DataContextType } from '@/types/dataContext';
import { ProjectProvider, useProjectContext } from './ProjectContext';
import { SubcontractorProvider, useSubcontractorContext } from './SubcontractorContext';
import { TradeProvider, useTradeContext } from './TradeContext';
import { ResponsibilityProvider, useResponsibilityContext } from './ResponsibilityContext';
import { SubcontractProvider, useSubcontractContext } from './SubcontractContext';

const DataContext = createContext<DataContextType | undefined>(undefined);

function DataContextProvider({ children }: { children: React.ReactNode }) {
  const projectContext = useProjectContext();
  const subcontractorContext = useSubcontractorContext();
  const tradeContext = useTradeContext();
  const responsibilityContext = useResponsibilityContext();
  const subcontractContext = useSubcontractContext();

  const isLoading = projectContext.isLoading || 
                   subcontractorContext.isLoading || 
                   tradeContext.isLoading || 
                   responsibilityContext.isLoading || 
                   subcontractContext.isLoading;

  const value: DataContextType = {
    // Projects
    projects: projectContext.projects,
    addProject: projectContext.addProject,
    updateProject: projectContext.updateProject,
    deleteProject: projectContext.deleteProject,
    
    // Subcontractors
    subcontractors: subcontractorContext.subcontractors,
    addSubcontractor: subcontractorContext.addSubcontractor,
    updateSubcontractor: subcontractorContext.updateSubcontractor,
    deleteSubcontractor: subcontractorContext.deleteSubcontractor,
    
    // Trades
    trades: tradeContext.trades,
    addTrade: tradeContext.addTrade,
    updateTrade: tradeContext.updateTrade,
    deleteTrade: tradeContext.deleteTrade,
    bulkDeleteTrades: tradeContext.bulkDeleteTrades,
    
    // Trade Items
    tradeItems: tradeContext.tradeItems,
    addTradeItem: tradeContext.addTradeItem,
    updateTradeItem: tradeContext.updateTradeItem,
    deleteTradeItem: tradeContext.deleteTradeItem,
    bulkDeleteTradeItems: tradeContext.bulkDeleteTradeItems,
    
    // Responsibilities
    responsibilities: responsibilityContext.responsibilities,
    addResponsibility: responsibilityContext.addResponsibility,
    updateResponsibility: responsibilityContext.updateResponsibility,
    deleteResponsibility: responsibilityContext.deleteResponsibility,
    
    // Subcontracts
    subcontracts: subcontractContext.subcontracts,
    addSubcontract: subcontractContext.addSubcontract,
    updateSubcontract: subcontractContext.updateSubcontract,
    deleteSubcontract: subcontractContext.deleteSubcontract,
    deleteManySubcontracts: subcontractContext.deleteManySubcontracts,
    
    // Loading state
    isLoading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <SubcontractorProvider>
        <ResponsibilityProvider>
          <TradeProvider>
            <SubcontractProvider>
              <DataContextProvider>
                {children}
              </DataContextProvider>
            </SubcontractProvider>
          </TradeProvider>
        </ResponsibilityProvider>
      </SubcontractorProvider>
    </ProjectProvider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
