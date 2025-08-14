
export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  name: string;
  code: string;
  location: string;
}

export interface ProjectSearchFilters {
  name: string;
  code: string;
  location: string;
}
