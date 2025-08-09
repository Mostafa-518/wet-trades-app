// Enhanced pagination hook with better state management

import { useState, useCallback, useMemo } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
}

export interface UsePaginationResult {
  // Current state
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Computed values
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  
  // Page range for pagination UI
  pageRange: number[];
  
  // Actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
  
  // Utilities
  getPagedData: <T>(data: T[]) => T[];
  getOffsetAndLimit: () => { offset: number; limit: number };
}

/**
 * Enhanced pagination hook with comprehensive state management
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems: initialTotalItems = 0,
    pageSizeOptions = [5, 10, 20, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  // Computed values
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / pageSize))
  , [totalItems, pageSize]);

  const startIndex = useMemo(() => 
    (currentPage - 1) * pageSize
  , [currentPage, pageSize]);

  const endIndex = useMemo(() => 
    Math.min(startIndex + pageSize - 1, totalItems - 1)
  , [startIndex, pageSize, totalItems]);

  const hasNextPage = useMemo(() => 
    currentPage < totalPages
  , [currentPage, totalPages]);

  const hasPreviousPage = useMemo(() => 
    currentPage > 1
  , [currentPage]);

  const isFirstPage = useMemo(() => 
    currentPage === 1
  , [currentPage]);

  const isLastPage = useMemo(() => 
    currentPage === totalPages
  , [currentPage, totalPages]);

  // Generate page range for pagination UI (e.g., [1, 2, 3, 4, 5])
  const pageRange = useMemo(() => {
    const range: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Calculate start and end of visible range
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }
    
    return range;
  }, [currentPage, totalPages]);

  // Actions
  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    // Adjust current page to maintain approximately the same position
    const currentStart = (currentPage - 1) * pageSize;
    const newPage = Math.floor(currentStart / newPageSize) + 1;
    setCurrentPage(Math.max(1, Math.min(newPage, Math.ceil(totalItems / newPageSize))));
  }, [currentPage, pageSize, totalItems]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItems(initialTotalItems);
  }, [initialPage, initialPageSize, initialTotalItems]);

  // Utilities
  const getPagedData = useCallback(<T,>(data: T[]): T[] => {
    const start = startIndex;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [startIndex, pageSize]);

  const getOffsetAndLimit = useCallback(() => ({
    offset: startIndex,
    limit: pageSize,
  }), [startIndex, pageSize]);

  return {
    // Current state
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    
    // Computed values
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    
    // Page range
    pageRange,
    
    // Actions
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    reset,
    
    // Utilities
    getPagedData,
    getOffsetAndLimit,
  };
}

/**
 * Hook for infinite pagination (load more)
 */
export function useInfinitePagination(options: UsePaginationOptions = {}) {
  const pagination = usePagination(options);
  const [loadedItems, setLoadedItems] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(async (loadFn: () => Promise<any[]>) => {
    if (isLoadingMore || !pagination.hasNextPage) return;
    
    setIsLoadingMore(true);
    try {
      const newItems = await loadFn();
      setLoadedItems(prev => [...prev, ...newItems]);
      pagination.nextPage();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pagination]);

  const reset = useCallback(() => {
    setLoadedItems([]);
    setIsLoadingMore(false);
    pagination.reset();
  }, [pagination]);

  return {
    ...pagination,
    loadedItems,
    isLoadingMore,
    loadMore,
    reset,
  };
}

/**
 * Hook for cursor-based pagination
 */
export function useCursorPagination<T = any>(options: { pageSize?: number } = {}) {
  const { pageSize = 10 } = options;
  const [cursors, setCursors] = useState<string[]>(['']); // Start with empty cursor
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const currentCursor = cursors[currentCursorIndex];
  const hasPreviousPage = currentCursorIndex > 0;

  const setPageData = useCallback((newItems: T[], nextCursor?: string, hasNext = false) => {
    setItems(newItems);
    setHasNextPage(hasNext);
    
    // Add next cursor if it doesn't exist
    if (nextCursor && !cursors.includes(nextCursor)) {
      setCursors(prev => [...prev, nextCursor]);
    }
  }, [cursors]);

  const nextPage = useCallback(() => {
    if (hasNextPage && currentCursorIndex < cursors.length - 1) {
      setCurrentCursorIndex(prev => prev + 1);
    }
  }, [hasNextPage, currentCursorIndex, cursors.length]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentCursorIndex(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const reset = useCallback(() => {
    setCursors(['']);
    setCurrentCursorIndex(0);
    setItems([]);
    setHasNextPage(false);
  }, []);

  return {
    items,
    currentCursor,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    setPageData,
    nextPage,
    previousPage,
    reset,
  };
}

export default usePagination;