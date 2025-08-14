// Enhanced Query Client with better defaults and cache management

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Default query options with optimized settings
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors except 429 (rate limit)
      if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Cache configuration
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes (renamed from cacheTime)
    
    // Background refetch configuration
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
    refetchOnMount: true,
    
    // Error handling
    throwOnError: false,
    
    // Network mode
    networkMode: 'online',
  },
  mutations: {
    // Retry configuration for mutations
    retry: (failureCount, error: any) => {
      // Don't retry mutations on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 1; // Only retry once for server errors
    },
    retryDelay: 1000,
    
    // Network mode
    networkMode: 'online',
  },
};

/**
 * Create enhanced query client with better defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

/**
 * Enhanced query client instance
 */
export const queryClient = createQueryClient();

/**
 * Query client utilities
 */
export const queryClientUtils = {
  /**
   * Clear all cached data
   */
  clearAll: () => {
    queryClient.clear();
  },

  /**
   * Invalidate all queries matching a pattern
   */
  invalidateByPattern: (pattern: readonly unknown[]) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return pattern.every((item, index) => query.queryKey[index] === item);
      },
    });
  },

  /**
   * Remove queries matching a pattern
   */
  removeByPattern: (pattern: readonly unknown[]) => {
    queryClient.removeQueries({
      predicate: (query) => {
        return pattern.every((item, index) => query.queryKey[index] === item);
      },
    });
  },

  /**
   * Set query data with proper typing
   */
  setQueryData: <T>(queryKey: readonly unknown[], data: T | ((old: T | undefined) => T)) => {
    queryClient.setQueryData(queryKey, data);
  },

  /**
   * Get query data with proper typing
   */
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  /**
   * Cancel all queries matching a pattern
   */
  cancelByPattern: async (pattern: readonly unknown[]) => {
    await queryClient.cancelQueries({
      predicate: (query) => {
        return pattern.every((item, index) => query.queryKey[index] === item);
      },
    });
  },

  /**
   * Prefetch query with error handling
   */
  prefetch: async <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options?: { staleTime?: number }
  ) => {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime,
      });
    } catch (error) {
      console.warn('Failed to prefetch query:', queryKey, error);
    }
  },

  /**
   * Get cache statistics for debugging
   */
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      successQueries: queries.filter(q => q.state.status === 'success').length,
    };
  },


};

export default queryClient;