
export interface Subcontractor {
  id: string;
  name: string; // This will now be mapped from company_name
  companyName: string;
  representativeName: string;
  commercialRegistration: string;
  taxCardNo: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  totalProjects: number;
  currentProjects: number;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubcontractorFormData {
  companyName: string;
  representativeName: string;
  commercialRegistration: string;
  taxCardNo: string;
  email: string;
  phone: string;
}
