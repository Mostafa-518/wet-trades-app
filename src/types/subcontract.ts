export interface TradeItem {
  id: string;
  trade: string;
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  wastagePercentage?: number; // NEW
}

export interface FormData {
  project: string;
  subcontractor: string;
  tradeItems: TradeItem[];
  responsibilities: string[];
  pdfFile: File | null;
  dateOfIssuing?: string; // <--- FIXED: added property
}

export interface Project {
  id: string;
  name: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  rep: string;
  phone: string;
}

export interface TradeItemOption {
  item: string;
  unit: string;
}

export interface SubcontractStepperProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

// Database trade item structure
export interface SubcontractTradeItemDB {
  id: string;
  subcontract_id: string;
  trade_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  wastage_percentage?: number; // NEW
}

// Updated Subcontract interface to match what components expect and database schema
export interface Subcontract {
  id: string;
  contractId: string;
  project: string;
  subcontractor: string;
  tradeItems: TradeItem[];
  responsibilities: string[];
  totalValue: number;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  dateOfIssuing?: string; // NEW
  description: string;
  createdAt: string;
  updatedAt: string;
  contractType: 'subcontract' | 'ADD'; // NEW
  addendumNumber?: string; // NEW: for ADD
  parentSubcontractId?: string; // NEW: for ADD - which contract this addendum is for
}

// Frontend form data
export interface FormData {
  project: string;
  subcontractor: string;
  tradeItems: TradeItem[];
  responsibilities: string[];
  pdfFile: File | null;
  dateOfIssuing?: string; // already present
  contractType?: 'subcontract' | 'ADD'; // NEW
  addendumNumber?: string; // NEW
  parentSubcontractId?: string; // NEW
}

export interface SubcontractFormData {
  project: string;
  subcontractor: string;
  tradeItems: TradeItem[];
  responsibilities: string[];
  pdfFile: File | null;
  dateOfIssuing?: string; // NEW
}
