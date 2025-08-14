// Enhanced useMutation hook with better error handling and cache invalidation

import { useMutation, useQueryClient, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryKeyUtils } from '@/lib/query/keys';
import { ApiResponse } from '@/types/api';
import { AsyncState } from '@/types/common';

export interface UseApiMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  // Custom options
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: readonly unknown[][] | 'auto' | ((data: TData, variables: TVariables) => readonly unknown[][]);
  updateCache?: (data: TData, variables: TVariables) => void;
  optimisticUpdate?: (variables: TVariables) => void;
  rollbackOptimistic?: (error: TError, variables: TVariables, context: TContext) => void;
}

export interface UseApiMutationResult<TData, TError, TVariables, TContext> {
  // Core mutation result properties
  data: TData | undefined;
  error: TError | null;
  isPending: boolean;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  
  // Additional utilities
  asyncState: AsyncState<TData, TError>;
  clearError: () => void;
  executeAsync: (variables: TVariables) => Promise<TData>;
}

/**
 * Enhanced useMutation hook with better defaults and error handling
 */
export function useApiMutation<TData = any, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, TError, TVariables, TContext> = {}
): UseApiMutationResult<TData, TError, TVariables, TContext> {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
    invalidateQueries = 'auto',
    updateCache,
    optimisticUpdate,
    rollbackOptimistic,
    onSuccess,
    onError,
    onMutate,
    ...mutationOptions
  } = options;

  const queryResult = useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Perform optimistic update
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }

      // Call custom onMutate
      const context = await onMutate?.(variables);
      return context;
    },
    onSuccess: async (data: TData, variables: TVariables, context: TContext) => {
      // Show success toast
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default',
        });
      }

      // Update cache
      if (updateCache) {
        updateCache(data, variables);
      }

      // Invalidate queries
      await handleQueryInvalidation(data, variables, invalidateQueries, queryClient);

      // Call custom onSuccess
      onSuccess?.(data, variables, context);
    },
    onError: (error: TError, variables: TVariables, context: TContext) => {
      // Show error toast
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: getErrorMessage(error) || errorMessage,
          variant: 'destructive',
        });
      }

      // Rollback optimistic update
      if (rollbackOptimistic) {
        rollbackOptimistic(error, variables, context);
      }

      // Call custom onError
      onError?.(error, variables, context);
    },
    ...mutationOptions,
  });

  // Create async state object
  const asyncState: AsyncState<TData, TError> = {
    data: queryResult.data ?? null,
    error: queryResult.error,
    loading: queryResult.isPending,
    status: queryResult.isPending ? 'loading' : queryResult.error ? 'error' : queryResult.data ? 'success' : 'idle',
  };

  return {
    data: queryResult.data,
    error: queryResult.error,
    isPending: queryResult.isPending,
    mutateAsync: queryResult.mutateAsync,
    asyncState,
    clearError: queryResult.reset,
    executeAsync: async (variables: TVariables) => {
      const result = await queryResult.mutateAsync(variables);
      return result;
    },
  };
}

/**
 * Hook for create mutations
 */
export function useCreateMutation<TData = any, TVariables = any>(
  entityType: keyof typeof queryKeys,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, Error, TVariables, unknown> = {}
) {
  return useApiMutation(mutationFn, {
    successMessage: `${entityType} created successfully`,
    invalidateQueries: [queryKeyUtils.invalidateEntityLists(entityType)],
    ...options,
  });
}

/**
 * Hook for update mutations
 */
export function useUpdateMutation<TData = any, TVariables = { id: string; [key: string]: any }>(
  entityType: keyof typeof queryKeys,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, Error, TVariables, unknown> = {}
) {
  return useApiMutation(mutationFn, {
    successMessage: `${entityType} updated successfully`,
    invalidateQueries: (data, variables) => [
      queryKeyUtils.invalidateEntityLists(entityType),
      queryKeyUtils.invalidateEntityDetail(entityType, (variables as any).id),
    ],
    ...options,
  });
}

/**
 * Hook for delete mutations
 */
export function useDeleteMutation<TVariables = { id: string }>(
  entityType: keyof typeof queryKeys,
  mutationFn: (variables: TVariables) => Promise<any>,
  options: UseApiMutationOptions<any, Error, TVariables, unknown> = {}
) {
  return useApiMutation(mutationFn, {
    successMessage: `${entityType} deleted successfully`,
    invalidateQueries: (data, variables) => [
      queryKeyUtils.invalidateEntityLists(entityType),
      queryKeyUtils.invalidateEntityDetail(entityType, (variables as any).id),
    ],
    ...options,
  });
}

/**
 * Hook for batch mutations
 */
export function useBatchMutation<TData = any, TVariables = any[]>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, Error, TVariables, unknown> = {}
) {
  return useApiMutation(mutationFn, {
    successMessage: 'Batch operation completed successfully',
    ...options,
  });
}

/**
 * Handle query invalidation based on configuration
 */
async function handleQueryInvalidation<TData, TVariables>(
  data: TData,
  variables: TVariables,
  invalidateQueries: UseApiMutationOptions<TData, Error, TVariables, unknown>['invalidateQueries'],
  queryClient: any
) {
  if (!invalidateQueries) return;

  let queriesToInvalidate: readonly unknown[][];

  if (invalidateQueries === 'auto') {
    // Auto-invalidate common query patterns
    queriesToInvalidate = [
      ['users'], ['projects'], ['subcontractors'], ['subcontracts'], 
      ['trades'], ['responsibilities'], ['alerts']
    ];
  } else if (typeof invalidateQueries === 'function') {
    queriesToInvalidate = invalidateQueries(data, variables);
  } else {
    queriesToInvalidate = invalidateQueries;
  }

  // Invalidate each query
  for (const queryKey of queriesToInvalidate) {
    await queryClient.invalidateQueries({ queryKey });
  }
}

/**
 * Extract error message from error object
 */
function getErrorMessage(error: any): string | undefined {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.userMessage) return error.userMessage;
  if (error?.response?.data?.message) return error.response.data.message;
  return undefined;
}

export default useApiMutation;