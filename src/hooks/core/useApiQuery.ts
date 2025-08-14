// Enhanced useQuery hook with better error handling and caching

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { ApiResponse, QueryParams } from '@/types/api';
import { AsyncState } from '@/types/common';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/query/keys';

export interface UseApiQueryOptions<TData, TError = Error> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  // Custom options
  showErrorToast?: boolean;
  errorMessage?: string;
  onError?: (error: TError) => void;
  onSuccess?: (data: TData) => void;
}

export interface UseApiQueryResult<TData, TError = Error> {
  // Core query result properties
  data: TData | undefined;
  error: TError | null;
  isLoading: boolean;
  refetch: () => void;
  
  // Additional utilities
  asyncState: AsyncState<TData, TError>;
  refresh: () => void;
  clearError: () => void;
}

/**
 * Enhanced useQuery hook with better defaults and error handling
 */
export function useApiQuery<TData = any, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options: UseApiQueryOptions<TData, TError> = {}
): UseApiQueryResult<TData, TError> {
  const { toast } = useToast();
  
  const {
    showErrorToast = true,
    errorMessage,
    onError,
    onSuccess,
    ...queryOptions
  } = options;

  const result = useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
  });

  // Create async state object
  const asyncState: AsyncState<TData, TError> = {
    data: result.data ?? null,
    error: result.error,
    loading: result.isLoading,
    status: result.isLoading ? 'loading' : result.error ? 'error' : result.data ? 'success' : 'idle',
  };

  return {
    ...result,
    asyncState,
    refresh: result.refetch,
    clearError: () => result.error && result.refetch(),
  };
}

/**
 * Hook for paginated queries
 */
export function usePaginatedQuery<TData = any>(
  queryKey: readonly unknown[],
  queryFn: (params: QueryParams) => Promise<ApiResponse<TData[]>>,
  params: QueryParams = {},
  options: UseApiQueryOptions<ApiResponse<TData[]>> = {}
) {
  const fullQueryKey = [...queryKey, params];
  
  return useApiQuery(
    fullQueryKey,
    () => queryFn(params),
    {
      staleTime: 30000, // 30 seconds
      ...options,
    }
  );
}

/**
 * Hook for list queries with automatic refetch
 */
export function useListQuery<TData = any>(
  entityType: keyof typeof queryKeys,
  queryFn: () => Promise<TData[]>,
  options: UseApiQueryOptions<TData[]> = {}
) {
  const entity = queryKeys[entityType] as any;
  const queryKey = entity.lists?.() || entity.all;
  
  return useApiQuery(
    queryKey,
    queryFn,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    }
  );
}

/**
 * Hook for detail queries
 */
export function useDetailQuery<TData = any>(
  entityType: keyof typeof queryKeys,
  id: string,
  queryFn: (id: string) => Promise<TData>,
  options: UseApiQueryOptions<TData> = {}
) {
  const entity = queryKeys[entityType] as any;
  const queryKey = entity.detail?.(id) || [...entity.all, id];
  
  return useApiQuery(
    queryKey,
    () => queryFn(id),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...options,
    }
  );
}

/**
 * Hook for dependent queries
 */
export function useDependentQuery<TData = any, TDependency = any>(
  queryKey: readonly unknown[],
  queryFn: (dependency: TDependency) => Promise<TData>,
  dependency: TDependency | null | undefined,
  options: UseApiQueryOptions<TData> = {}
) {
  return useApiQuery(
    [...queryKey, dependency],
    () => queryFn(dependency!),
    {
      enabled: dependency != null,
      ...options,
    }
  );
}

/**
 * Hook for cached queries with custom cache key
 */
export function useCachedQuery<TData = any>(
  cacheKey: string,
  queryFn: () => Promise<TData>,
  options: UseApiQueryOptions<TData> = {}
) {
  return useApiQuery(
    [cacheKey],
    queryFn,
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      ...options,
    }
  );
}

export default useApiQuery;