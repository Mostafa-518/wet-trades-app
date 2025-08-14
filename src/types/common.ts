// Common utility types for better type safety

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type NonNullable<T> = T extends null | undefined ? never : T;

// Form and validation types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
  status: LoadingState;
}

// Action types for reducers
export interface Action<TType = string, TPayload = any> {
  type: TType;
  payload?: TPayload;
}

// Event handlers
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// ID types for consistency
export type UUID = string;
export type EntityId = UUID;

// Generic entity base
export interface BaseEntity {
  id: EntityId;
  created_at: string;
  updated_at: string;
}

// Audit fields
export interface AuditFields {
  created_at: string;
  updated_at: string;
  created_by?: EntityId;
  updated_by?: EntityId;
}

// Permission types
export type Permission = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'admin' 
  | 'manage_users' 
  | 'manage_projects' 
  | 'manage_subcontractors'
  | 'manage_subcontracts'
  | 'manage_trades'
  | 'manage_responsibilities';

export interface PermissionCheck {
  permission: Permission;
  resource?: string;
  resourceId?: EntityId;
}

// Table and list types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableState<T = any> {
  data: T[];
  loading: boolean;
  error: Error | null;
  selectedRows: EntityId[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  sorting: {
    field: keyof T | null;
    direction: 'asc' | 'desc';
  };
  filters: Record<string, any>;
}

// File and upload types
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Theme and UI types
export type Theme = 'light' | 'dark' | 'system';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Deep partial type for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Pick by value type
export type PickByValue<T, ValueType> = Pick<T, {
  [Key in keyof T]: T[Key] extends ValueType ? Key : never;
}[keyof T]>;

// Omit by value type
export type OmitByValue<T, ValueType> = Omit<T, {
  [Key in keyof T]: T[Key] extends ValueType ? Key : never;
}[keyof T]>;