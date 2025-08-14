
import { Project, ProjectFormData } from '@/types/project';
import { Subcontractor, SubcontractorFormData } from '@/types/subcontractor';
import { Trade, TradeFormData, TradeItem, TradeItemFormData } from '@/types/trade';
import { Responsibility } from '@/types/responsibility';
import { Subcontract } from '@/types/subcontract';

export interface DataContextType {
  // Projects
  projects: Project[];
  addProject: (data: ProjectFormData) => Promise<void>;
  updateProject: (id: string, data: ProjectFormData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Subcontractors
  subcontractors: Subcontractor[];
  addSubcontractor: (data: SubcontractorFormData) => Promise<void>;
  updateSubcontractor: (id: string, data: SubcontractorFormData) => Promise<void>;
  deleteSubcontractor: (id: string) => Promise<void>;
  
  // Trades
  trades: Trade[];
  addTrade: (data: TradeFormData) => Promise<void>;
  updateTrade: (id: string, data: TradeFormData) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  bulkDeleteTrades: (ids: string[]) => Promise<void>;
  
  // Trade Items
  tradeItems: TradeItem[];
  addTradeItem: (data: TradeItemFormData) => Promise<void>;
  updateTradeItem: (id: string, data: TradeItemFormData) => Promise<void>;
  deleteTradeItem: (id: string) => Promise<void>;
  bulkDeleteTradeItems: (ids: string[]) => Promise<void>;
  
  // Responsibilities
  responsibilities: Responsibility[];
  addResponsibility: (data: Partial<Responsibility>) => Promise<void>;
  updateResponsibility: (id: string, data: Partial<Responsibility>) => Promise<void>;
  deleteResponsibility: (id: string) => Promise<void>;
  
  // Subcontracts
  subcontracts: Subcontract[];
  addSubcontract: (data: Partial<Subcontract>) => Promise<void>;
  updateSubcontract: (id: string, data: Partial<Subcontract>) => Promise<void>;
  deleteSubcontract: (id: string) => Promise<void>;
  deleteManySubcontracts: (ids: string[]) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
}
