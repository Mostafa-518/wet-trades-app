
// Utility functions for managing persistent form state across the app

export interface FormStateManager {
  clearAllFormData: () => void;
  clearFormData: (key: string) => void;
  getAllFormKeys: () => string[];
  exportFormData: () => Record<string, any>;
  importFormData: (data: Record<string, any>) => void;
}

export const createFormStateManager = (storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): FormStateManager => {
  const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
  const FORM_PREFIX = 'form-state-';

  return {
    clearAllFormData: () => {
      const keysToRemove = Object.keys(storage).filter(key => key.startsWith(FORM_PREFIX));
      keysToRemove.forEach(key => storage.removeItem(key));
    },

    clearFormData: (key: string) => {
      const storageKey = key.startsWith(FORM_PREFIX) ? key : `${FORM_PREFIX}${key}`;
      storage.removeItem(storageKey);
    },

    getAllFormKeys: () => {
      return Object.keys(storage)
        .filter(key => key.startsWith(FORM_PREFIX))
        .map(key => key.replace(FORM_PREFIX, ''));
    },

    exportFormData: () => {
      const formData: Record<string, any> = {};
      Object.keys(storage).forEach(key => {
        if (key.startsWith(FORM_PREFIX)) {
          try {
            const data = storage.getItem(key);
            if (data) {
              formData[key.replace(FORM_PREFIX, '')] = JSON.parse(data);
            }
          } catch (error) {
            console.warn(`Failed to export form data for key: ${key}`, error);
          }
        }
      });
      return formData;
    },

    importFormData: (data: Record<string, any>) => {
      Object.entries(data).forEach(([key, value]) => {
        try {
          const storageKey = `${FORM_PREFIX}${key}`;
          storage.setItem(storageKey, JSON.stringify(value));
        } catch (error) {
          console.warn(`Failed to import form data for key: ${key}`, error);
        }
      });
    }
  };
};

// Global form state manager instance
export const formStateManager = createFormStateManager('localStorage');

// Hook for components that need to manage form state globally
export const useFormStateManager = () => {
  return formStateManager;
};
