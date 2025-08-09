
import { useState, useEffect, useCallback, useRef } from 'react';
import { PersistentFormOptions } from './types';
import { createStorageOperations, createDebouncedSave } from './storage';
import { createUrlSyncOperations } from './url-sync';
import { createFormHelpers } from './form-helpers';

export function usePersistentFormState<T extends Record<string, any>>(
  initialValues: T,
  options: PersistentFormOptions = {}
) {
  const {
    customKey,
    syncWithUrl = false,
    storageType = 'localStorage',
    debounceMs = 300,
    excludeFields = [],
    expirationHours = 1,
    enableReset = true
  } = options;

  // Generate storage key based on current path or custom key
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const storageKey = customKey || `form-state-${currentPath}`;
  const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
  const initializedRef = useRef(false);

  // Create storage operations
  const { loadFromStorage, saveToStorage, clearStorage, isStorageExpired } = createStorageOperations(
    storageKey,
    storage,
    initialValues,
    excludeFields,
    expirationHours
  );

  // Create URL sync operations
  const { loadFromUrl, updateUrl, clearUrl } = createUrlSyncOperations<T>(
    syncWithUrl,
    excludeFields
  );

  // Load initial state from storage and URL
  const loadPersistedState = useCallback((): T => {
    try {
      // Loading persisted state for key: ${storageKey}
      
      // Start with initial values
      let persistedState = { ...initialValues };

      // Load from storage first (if not expired)
      if (!isStorageExpired()) {
        const storedData = loadFromStorage();
        if (storedData && Object.keys(storedData).length > 0) {
          // Loaded from storage
          persistedState = { ...persistedState, ...storedData };
        }
      } else {
        // Storage data expired, using initial values
        clearStorage();
      }

      // Load from URL if enabled (URL takes precedence)
      if (syncWithUrl && typeof window !== 'undefined') {
        const urlData = loadFromUrl(window.location.search);
        if (urlData && Object.keys(urlData).length > 0) {
          // Loaded from URL
          persistedState = { ...persistedState, ...urlData };
        }
      }

      // Filter out excluded fields
      excludeFields.forEach(field => {
        if (field in persistedState) {
          persistedState[field as keyof T] = initialValues[field as keyof T];
        }
      });

      // Final persisted state loaded
      return persistedState;
    } catch (error) {
      console.warn('Failed to load persisted form state:', error);
      return initialValues;
    }
  }, [initialValues, storageKey, syncWithUrl, isStorageExpired, loadFromStorage, loadFromUrl, clearStorage, excludeFields]);

  const [formValues, setFormValues] = useState<T>(() => {
    const persisted = loadPersistedState();
    initializedRef.current = true;
    return persisted;
  });

  // Create debounced save function
  const debouncedSave = createDebouncedSave(saveToStorage, debounceMs);

  // Generic change handler for all input types
  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormValues(prev => {
      const newValues = { ...prev, [field]: value };
      
      // Save to storage
      debouncedSave(newValues);
      
      // Update URL if enabled
      if (syncWithUrl && typeof window !== 'undefined') {
        updateUrl(newValues, { 
          pathname: window.location.pathname, 
          search: window.location.search 
        });
      }
      
      return newValues;
    });
  }, [debouncedSave, updateUrl, syncWithUrl]);

  // Batch update multiple fields
  const handleBatchChange = useCallback((updates: Partial<T>) => {
    setFormValues(prev => {
      const newValues = { ...prev, ...updates };
      
      // Save to storage
      debouncedSave(newValues);
      
      // Update URL if enabled
      if (syncWithUrl && typeof window !== 'undefined') {
        updateUrl(newValues, { 
          pathname: window.location.pathname, 
          search: window.location.search 
        });
      }
      
      return newValues;
    });
  }, [debouncedSave, updateUrl, syncWithUrl]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    // Resetting form to initial values
    setFormValues(initialValues);
    clearStorage();
    if (syncWithUrl && typeof window !== 'undefined') {
      clearUrl(window.location.pathname);
    }
  }, [initialValues, clearStorage, clearUrl, syncWithUrl]);

  // Check if form has any persisted data
  const hasPersistedData = useCallback(() => {
    return Object.keys(formValues).some(key => {
      const currentValue = formValues[key as keyof T];
      const initialValue = initialValues[key as keyof T];
      return currentValue !== initialValue && currentValue !== '' && currentValue !== null && currentValue !== undefined;
    });
  }, [formValues, initialValues]);

  // Reload persisted state when returning to the page
  useEffect(() => {
    if (!initializedRef.current) return;

    const handleFocus = () => {
      // Window focused, checking for updated persisted state
      if (!isStorageExpired()) {
        const persistedState = loadPersistedState();
        setFormValues(persistedState);
      } else {
        // Storage expired on focus, clearing...
        clearStorage();
        setFormValues(initialValues);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadPersistedState, isStorageExpired, clearStorage, initialValues]);

  // Auto-cleanup expired data on mount
  useEffect(() => {
    if (isStorageExpired()) {
      // Storage expired on mount, clearing...
      clearStorage();
    }
  }, [isStorageExpired, clearStorage]);

  // Create form helpers
  const formHelpers = createFormHelpers(formValues, handleChange, initialValues);

  return {
    formValues,
    handleChange,
    handleBatchChange,
    resetForm,
    hasPersistedData,
    isExpired: isStorageExpired,
    ...formHelpers
  };
}

// Re-export types for convenience
export type { PersistentFormOptions } from './types';
