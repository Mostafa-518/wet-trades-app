
// Legacy API client - now using enhanced client
// This file is kept for backward compatibility

import { apiClient } from '@/lib/api/client';

// Export the enhanced client instance for backward compatibility
const api = apiClient.getInstance();

export default api;
export { apiClient };
