import { useMemo, useCallback } from 'react';

interface UseOptimizedTableProps<T> {
  data: T[];
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: () => void;
  getItemId: (item: T) => string;
}

/**
 * Custom hook to optimize table performance by memoizing handlers and computed values
 */
export function useOptimizedTable<T>({
  data,
  selectedIds,
  onToggleOne,
  onToggleAll,
  getItemId
}: UseOptimizedTableProps<T>) {
  
  // Memoize selection state calculations
  const selectionState = useMemo(() => {
    const selectedCount = selectedIds.size;
    const totalCount = data.length;
    const allSelected = totalCount > 0 && selectedCount === totalCount;
    const someSelected = selectedCount > 0 && selectedCount < totalCount;
    
    return {
      selectedCount,
      totalCount,
      allSelected,
      someSelected,
      noneSelected: selectedCount === 0
    };
  }, [selectedIds.size, data.length]);

  // Memoize item selection status checker
  const isItemSelected = useCallback((item: T) => {
    return selectedIds.has(getItemId(item));
  }, [selectedIds, getItemId]);

  // Memoize toggle handlers factory
  const createToggleHandler = useCallback((item: T) => {
    const itemId = getItemId(item);
    return () => onToggleOne(itemId);
  }, [onToggleOne, getItemId]);

  // Memoize optimized handlers
  const optimizedHandlers = useMemo(() => ({
    onToggleAll,
    createToggleHandler,
    isItemSelected
  }), [onToggleAll, createToggleHandler, isItemSelected]);

  return {
    selectionState,
    optimizedHandlers
  };
}