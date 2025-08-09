
export interface ReportFilters {
  month: string;
  year: string;
  location: string;
  trades: string;
  projectName: string;
  projectCode: string;
  presentData: string;
  projectFilterType: 'name' | 'code';
  facilities: string[];
}

export interface SubcontractWithDetails {
  id: string;
  contract_number: string;
  total_value: number;
  status: string;
  project_id: string;
  subcontractor_id: string;
  date_of_issuing: string;
  projects: {
    name: string;
    code: string;
    location: string;
  };
  subcontractors: {
    company_name: string;
  };
  subcontract_trade_items: Array<{
    quantity: number;
    unit_price: number;
    total_price: number;
    wastage_percentage: number;
    trade_item_id: string;
    trade_items: {
      name: string;
      unit: string;
      trade_id: string;
      trades: {
        name: string;
        category: string;
      };
    };
  }>;
  subcontract_responsibilities: Array<{
    responsibility_id: string;
    responsibilities: {
      name: string;
    };
  }>;
}

export interface ReportTableData {
  item: string;
  averageRate: number;
  totalAmount: number;
  totalQuantity: number;
  wastage: number;
  unit: string;
  count: number;
}

export interface ReportData {
  totalSubcontracts: number;
  currentSubcontracts: number;
  filters: ReportFilters;
  tableData: ReportTableData[];
}

export interface FilterOptions {
  months: string[];
  years: string[];
  locations: string[];
  trades: string[];
  projectNames: string[];
  projectCodes: string[];
  presentDataOptions: string[];
  facilities: string[];
}
