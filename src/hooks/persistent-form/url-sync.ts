
export function createUrlSyncOperations<T extends Record<string, any>>(
  syncWithUrl: boolean,
  excludeFields: string[]
) {
  const loadFromUrl = (currentSearch: string): Partial<T> => {
    if (!syncWithUrl) return {};

    try {
      const urlParams = new URLSearchParams(currentSearch);
      const urlData: Partial<T> = {};
      
      urlParams.forEach((value, key) => {
        if (!excludeFields.includes(key) && value !== '' && value !== null) {
          // Try to parse as JSON for complex values, fallback to string
          try {
            urlData[key as keyof T] = JSON.parse(value);
          } catch {
            urlData[key as keyof T] = value as T[keyof T];
          }
        }
      });

      return urlData;
    } catch (error) {
      console.warn('Failed to load from URL:', error);
      return {};
    }
  };

  const updateUrl = (values: T, currentLocation: { pathname: string; search: string }) => {
    if (!syncWithUrl || typeof window === 'undefined') return;

    try {
      const searchParams = new URLSearchParams(currentLocation.search);
      
      Object.entries(values).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && value !== undefined && value !== null && value !== '') {
          // Convert complex values to JSON strings
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          searchParams.set(key, stringValue);
        } else {
          searchParams.delete(key);
        }
      });

      const newSearch = searchParams.toString();
      const newUrl = `${currentLocation.pathname}${newSearch ? `?${newSearch}` : ''}`;
      
      // Only update if URL actually changed
      if (newUrl !== `${currentLocation.pathname}${currentLocation.search}`) {
        window.history.replaceState({}, '', newUrl);
      }
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  };

  const clearUrl = (currentPathname: string) => {
    if (!syncWithUrl || typeof window === 'undefined') return;
    
    try {
      window.history.replaceState({}, '', currentPathname);
    } catch (error) {
      console.warn('Failed to clear URL:', error);
    }
  };

  return {
    loadFromUrl,
    updateUrl,
    clearUrl
  };
}
