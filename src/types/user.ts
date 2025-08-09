
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'procurement_manager' | 'procurement_engineer' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  avatar?: string;
}
