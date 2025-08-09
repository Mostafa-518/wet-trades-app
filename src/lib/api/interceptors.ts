// Enhanced request/response interceptors with retry logic and better error handling

import { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '@/integrations/supabase/client';

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  retries: 2,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors and 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

/**
 * Request ID generator for tracking requests
 */
let requestIdCounter = 0;
const generateRequestId = () => `req_${Date.now()}_${++requestIdCounter}`;

/**
 * Set up request interceptors
 */
export function setupRequestInterceptors(apiInstance: AxiosInstance) {
  apiInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Add request ID for tracking
      config.metadata = { 
        ...config.metadata, 
        requestId: generateRequestId(),
        startTime: Date.now()
      };

      // Add Supabase auth token
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth session for request:', error);
      }

      // Add request headers
      config.headers['X-Request-ID'] = config.metadata.requestId;
      config.headers['X-Client-Version'] = '1.0.0';
      config.headers['X-Timestamp'] = new Date().toISOString();

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚀 API Request [${config.metadata.requestId}]`);
        console.log('Method:', config.method?.toUpperCase());
        console.log('URL:', config.url);
        console.log('Headers:', config.headers);
        if (config.data) {
          console.log('Data:', config.data);
        }
        if (config.params) {
          console.log('Params:', config.params);
        }
        console.groupEnd();
      }

      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
}

/**
 * Set up response interceptors
 */
export function setupResponseInterceptors(apiInstance: AxiosInstance) {
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as InternalAxiosRequestConfig;
      const requestId = config.metadata?.requestId;
      const startTime = config.metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;


      // Add response metadata
      response.metadata = {
        requestId,
        duration,
        timestamp: new Date().toISOString(),
      };

      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig;
      const requestId = config?.metadata?.requestId;
      const startTime = config?.metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;

      // Handle retry logic
      const retryConfig = { ...defaultRetryConfig, ...config?.retryConfig };
      const currentRetryCount = config?.retryCount || 0;

      if (currentRetryCount < retryConfig.retries && retryConfig.retryCondition(error)) {
        config.retryCount = currentRetryCount + 1;
        
        // Calculate delay with exponential backoff
        const delay = retryConfig.retryDelay * Math.pow(2, currentRetryCount);
        
        console.warn(`Retrying request [${requestId}] in ${delay}ms (attempt ${config.retryCount}/${retryConfig.retries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiInstance.request(config);
      }

      // Enhanced error handling
      const enhancedError = enhanceError(error, requestId, duration);
      
      // Log error
      if (process.env.NODE_ENV === 'development') {
        console.group(`❌ API Error [${requestId}] - ${duration}ms`);
        console.error('Error:', enhancedError);
        console.error('Original Error:', error);
        console.groupEnd();
      }

      // Handle specific error cases
      await handleSpecificErrors(enhancedError);

      return Promise.reject(enhancedError);
    }
  );
}

/**
 * Enhance error with additional metadata
 */
function enhanceError(error: AxiosError, requestId?: string, duration?: number): any {
  const enhancedError: any = {
    ...error,
    metadata: {
      requestId,
      duration,
      timestamp: new Date().toISOString(),
    },
    isNetworkError: !error.response,
    isServerError: error.response && error.response.status >= 500,
    isClientError: error.response && error.response.status >= 400 && error.response.status < 500,
    isTimeout: error.code === 'ECONNABORTED',
  };

  // Add user-friendly message
  if (enhancedError.isNetworkError) {
    enhancedError.userMessage = 'Network connection failed. Please check your internet connection.';
  } else if (enhancedError.isTimeout) {
    enhancedError.userMessage = 'Request timed out. Please try again.';
  } else if (enhancedError.isServerError) {
    enhancedError.userMessage = 'Server error occurred. Please try again later.';
  } else if (error.response?.status === 401) {
    enhancedError.userMessage = 'Authentication required. Please log in again.';
  } else if (error.response?.status === 403) {
    enhancedError.userMessage = 'Access denied. You don\'t have permission to perform this action.';
  } else if (error.response?.status === 404) {
    enhancedError.userMessage = 'The requested resource was not found.';
  } else if (error.response?.status === 422) {
    enhancedError.userMessage = 'Invalid data provided. Please check your input.';
  } else {
    enhancedError.userMessage = 'An unexpected error occurred. Please try again.';
  }

  return enhancedError;
}

/**
 * Handle specific error cases
 */
async function handleSpecificErrors(error: any) {
  // Handle authentication errors
  if (error.response?.status === 401) {
    try {
      // Try to refresh the session
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        // If refresh fails, redirect to login
        console.warn('Session refresh failed, redirecting to login');
        window.location.href = '/login';
      }
    } catch (refreshError) {
      console.error('Error refreshing session:', refreshError);
      window.location.href = '/login';
    }
  }

  // Handle rate limiting (429)
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    if (retryAfter) {
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    }
  }

  // Handle maintenance mode (503)
  if (error.response?.status === 503) {
    console.warn('Service temporarily unavailable (maintenance mode)');
  }
}

/**
 * Create request/response interceptor setup function
 */
export function setupInterceptors(apiInstance: AxiosInstance) {
  setupRequestInterceptors(apiInstance);
  setupResponseInterceptors(apiInstance);
}

// Type declarations for extended config
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      requestId?: string;
      startTime?: number;
    };
    retryCount?: number;
    retryConfig?: Partial<RetryConfig>;
  }

  interface AxiosResponse {
    metadata?: {
      requestId?: string;
      duration?: number;
      timestamp?: string;
    };
  }
}