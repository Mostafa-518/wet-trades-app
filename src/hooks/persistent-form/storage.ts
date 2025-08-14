
import { PersistentFormOptions, StoredFormData } from './types';

export function createStorageOperations<T extends Record<string, any>>(
  storageKey: string,
  storage: Storage,
  initialValues: T,
  excludeFields: string[],
  expirationHours: number = 1
) {
  const loadFromStorage = (): Partial<T> => {
    try {
      // Loading from storage
      const storedData = storage.getItem(storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData) as StoredFormData<Record<string, any>>;
        // Parsed storage data
        
        // Check if data has expired
        const now = Date.now();
        const expirationTime = parsed.timestamp + (expirationHours * 60 * 60 * 1000);
        
        if (now > expirationTime) {
          // Storage data expired, clearing...
          storage.removeItem(storageKey);
          return {};
        }
        
        // Only return non-empty values
        const filteredData: Partial<T> = {};
        Object.entries(parsed.data || {}).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            filteredData[key as keyof T] = value as T[keyof T];
          }
        });
        
        return filteredData;
      }
      // No data found in storage
    } catch (error) {
      console.warn('Failed to load from storage:', error);
      // Clear corrupted data
      storage.removeItem(storageKey);
    }
    return {};
  };

  const saveToStorage = (values: T): void => {
    try {
      // Filter out excluded fields and empty values before saving
      const valuesToSave: Partial<T> = {};
      
      Object.entries(values).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && value !== null && value !== undefined && value !== '') {
          valuesToSave[key as keyof T] = value;
        }
      });
      
      // Only save if there's actual data to persist
      if (Object.keys(valuesToSave).length > 0) {
        const dataToStore: StoredFormData<Partial<T>> = {
          data: valuesToSave,
          timestamp: Date.now(),
          version: '1.0'
        };
        
        // Saving to storage
        storage.setItem(storageKey, JSON.stringify(dataToStore));
      } else {
        // Clear storage if no data to save
        clearStorage();
      }
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  };

  const clearStorage = (): void => {
    try {
      // Clearing storage
      storage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  };

  const isStorageExpired = (): boolean => {
    try {
      const storedData = storage.getItem(storageKey);
      if (!storedData) return false;
      
      const parsed = JSON.parse(storedData) as StoredFormData<any>;
      const now = Date.now();
      const expirationTime = parsed.timestamp + (expirationHours * 60 * 60 * 1000);
      
      return now > expirationTime;
    } catch {
      return true; // Consider expired if can't parse
    }
  };

  return {
    loadFromStorage,
    saveToStorage,
    clearStorage,
    isStorageExpired
  };
}

export function createDebouncedSave<T extends Record<string, any>>(
  saveFunction: (values: T) => void,
  debounceMs: number
) {
  let timeoutId: NodeJS.Timeout;
  
  return (values: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveFunction(values);
    }, debounceMs);
  };
}
