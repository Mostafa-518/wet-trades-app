// Enhanced API types for better type safety

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'not_in';
  value: any;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortOption[];
  filters?: FilterOption[];
  search?: string;
}

// Utility types for better type inference
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : never;
export type ExtractPaginatedData<T> = T extends PaginatedResponse<infer U> ? U : never;

// Resource operation types
export interface CreateOperation<TData, TResult = TData> {
  data: TData;
  result: TResult;
}

export interface UpdateOperation<TData, TResult = TData> {
  id: string;
  data: Partial<TData>;
  result: TResult;
}

export interface DeleteOperation {
  id: string;
  result: { success: boolean };
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate: boolean;
  maxAge: number;
}