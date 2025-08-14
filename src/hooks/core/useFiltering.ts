// Reusable filtering logic for tables and lists

import { useState, useMemo, useCallback } from 'react';
import { FilterOption, SortOption } from '@/types/api';

export interface FilterState {
  search: string;
  filters: FilterOption[];
  sorting: SortOption[];
}

export interface UseFilteringOptions<T> {
  initialSearch?: string;
  initialFilters?: FilterOption[];
  initialSorting?: SortOption[];
  filterFn?: (item: T, state: FilterState) => boolean;
  sortFn?: (a: T, b: T, sorting: SortOption[]) => number;
  debounceMs?: number;
}

export interface UseFilteringResult<T> {
  // State
  search: string;
  filters: FilterOption[];
  sorting: SortOption[];
  filteredData: T[];
  
  // Actions
  setSearch: (search: string) => void;
  addFilter: (filter: FilterOption) => void;
  removeFilter: (field: string) => void;
  updateFilter: (field: string, updates: Partial<FilterOption>) => void;
  clearFilters: () => void;
  setSorting: (sorting: SortOption[]) => void;
  addSort: (sort: SortOption) => void;
  removeSort: (field: string) => void;
  toggleSort: (field: string) => void;
  clearSorting: () => void;
  reset: () => void;
  
  // Utilities
  hasActiveFilters: boolean;
  hasActiveSorting: boolean;
  getFilterValue: (field: string) => any;
  getSortDirection: (field: string) => 'asc' | 'desc' | null;
}

/**
 * Hook for managing filtering, sorting, and searching
 */
export function useFiltering<T>(
  data: T[],
  options: UseFilteringOptions<T> = {}
): UseFilteringResult<T> {
  const {
    initialSearch = '',
    initialFilters = [],
    initialSorting = [],
    filterFn = defaultFilterFunction,
    sortFn = defaultSortFunction,
  } = options;

  // State
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState<FilterOption[]>(initialFilters);
  const [sorting, setSorting] = useState<SortOption[]>(initialSorting);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply filtering
    if (search || filters.length > 0) {
      const filterState: FilterState = { search, filters, sorting };
      result = result.filter(item => filterFn(item, filterState));
    }
    
    // Apply sorting
    if (sorting.length > 0) {
      result.sort((a, b) => sortFn(a, b, sorting));
    }
    
    return result;
  }, [data, search, filters, sorting, filterFn, sortFn]);

  // Filter actions
  const addFilter = useCallback((filter: FilterOption) => {
    setFilters(prev => {
      const existing = prev.findIndex(f => f.field === filter.field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field));
  }, []);

  const updateFilter = useCallback((field: string, updates: Partial<FilterOption>) => {
    setFilters(prev => prev.map(f => 
      f.field === field ? { ...f, ...updates } : f
    ));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Sorting actions
  const addSort = useCallback((sort: SortOption) => {
    setSorting(prev => {
      const existing = prev.findIndex(s => s.field === sort.field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = sort;
        return updated;
      }
      return [...prev, sort];
    });
  }, []);

  const removeSort = useCallback((field: string) => {
    setSorting(prev => prev.filter(s => s.field !== field));
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSorting(prev => {
      const existing = prev.find(s => s.field === field);
      if (!existing) {
        return [...prev, { field, direction: 'asc' }];
      } else if (existing.direction === 'asc') {
        return prev.map(s => 
          s.field === field ? { ...s, direction: 'desc' as const } : s
        );
      } else {
        return prev.filter(s => s.field !== field);
      }
    });
  }, []);

  const clearSorting = useCallback(() => {
    setSorting([]);
  }, []);

  // Reset all filters and sorting
  const reset = useCallback(() => {
    setSearch(initialSearch);
    setFilters(initialFilters);
    setSorting(initialSorting);
  }, [initialSearch, initialFilters, initialSorting]);

  // Utility functions
  const getFilterValue = useCallback((field: string) => {
    const filter = filters.find(f => f.field === field);
    return filter?.value;
  }, [filters]);

  const getSortDirection = useCallback((field: string): 'asc' | 'desc' | null => {
    const sort = sorting.find(s => s.field === field);
    return sort?.direction || null;
  }, [sorting]);

  return {
    // State
    search,
    filters,
    sorting,
    filteredData,
    
    // Actions
    setSearch,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setSorting,
    addSort,
    removeSort,
    toggleSort,
    clearSorting,
    reset,
    
    // Utilities
    hasActiveFilters: search.length > 0 || filters.length > 0,
    hasActiveSorting: sorting.length > 0,
    getFilterValue,
    getSortDirection,
  };
}

/**
 * Default filter function
 */
function defaultFilterFunction<T>(item: T, state: FilterState): boolean {
  // Search filter
  if (state.search) {
    const searchLower = state.search.toLowerCase();
    const itemString = JSON.stringify(item).toLowerCase();
    if (!itemString.includes(searchLower)) {
      return false;
    }
  }
  
  // Field filters
  for (const filter of state.filters) {
    const value = getNestedValue(item, filter.field);
    if (!applyFilter(value, filter)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Default sort function
 */
function defaultSortFunction<T>(a: T, b: T, sorting: SortOption[]): number {
  for (const sort of sorting) {
    const aValue = getNestedValue(a, sort.field);
    const bValue = getNestedValue(b, sort.field);
    
    const result = compareValues(aValue, bValue);
    if (result !== 0) {
      return sort.direction === 'asc' ? result : -result;
    }
  }
  
  return 0;
}

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Apply filter condition
 */
function applyFilter(value: any, filter: FilterOption): boolean {
  const { operator, value: filterValue } = filter;
  
  switch (operator) {
    case 'eq':
      return value === filterValue;
    case 'ne':
      return value !== filterValue;
    case 'gt':
      return value > filterValue;
    case 'gte':
      return value >= filterValue;
    case 'lt':
      return value < filterValue;
    case 'lte':
      return value <= filterValue;
    case 'like':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(value);
    case 'not_in':
      return Array.isArray(filterValue) && !filterValue.includes(value);
    default:
      return true;
  }
}

/**
 * Compare two values for sorting
 */
function compareValues(a: any, b: any): number {
  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  
  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  
  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  
  // Handle strings
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  
  // Convert to strings and compare
  return String(a).localeCompare(String(b));
}

export default useFiltering;