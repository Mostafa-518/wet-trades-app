// Enhanced API client with retry logic, caching, and better error handling

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { setupInterceptors } from './interceptors';
import { apiCache, cachePresets } from './cache';
import { ApiResponse, RequestConfig, QueryParams } from '@/types/api';

/**
 * Enhanced API client class
 */
export class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL: baseURL || 'https://mcjdeqfqbucfterqzglp.supabase.co',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Set up interceptors
    setupInterceptors(this.instance);
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    
    if (params.sort?.length) {
      params.sort.forEach((sort, index) => {
        searchParams.set(`sort[${index}][field]`, sort.field);
        searchParams.set(`sort[${index}][direction]`, sort.direction);
      });
    }
    
    if (params.filters?.length) {
      params.filters.forEach((filter, index) => {
        searchParams.set(`filters[${index}][field]`, filter.field);
        searchParams.set(`filters[${index}][operator]`, filter.operator);
        searchParams.set(`filters[${index}][value]`, filter.value.toString());
      });
    }
    
    return searchParams.toString();
  }

  /**
   * GET request with caching support
   */
  async get<T>(
    endpoint: string, 
    config: RequestConfig & { params?: QueryParams } = {}
  ): Promise<T> {
    const { cache = true, cacheTTL = cachePresets.medium.ttl, params, ...axiosConfig } = config;
    
    const queryString = params ? this.buildQueryString(params) : '';
    const fullUrl = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Check cache first
    if (cache) {
      const cachedData = apiCache.get<T>(fullUrl);
      if (cachedData) {
        return cachedData;
      }
    }
    
    const response: AxiosResponse<T> = await this.instance.get(fullUrl, axiosConfig);
    
    // Cache successful responses
    if (cache && response.status === 200) {
      apiCache.set(
        fullUrl,
        response.data,
        { 
          enabled: true, 
          ttl: cacheTTL,
          staleWhileRevalidate: true,
          maxAge: cacheTTL * 2
        },
        params,
        response.headers as Record<string, string>
      );
    }
    
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    config: RequestConfig = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(endpoint, data, config);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, 'POST');
    
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string, 
    data?: any, 
    config: RequestConfig = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(endpoint, data, config);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, 'PUT');
    
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string, 
    data?: any, 
    config: RequestConfig = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(endpoint, data, config);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, 'PATCH');
    
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(endpoint, config);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, 'DELETE');
    
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response: AxiosResponse<T> = await this.instance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      timeout: 5 * 60 * 1000, // 5 minutes for file uploads
    });
    
    return response.data;
  }

  /**
   * Download file
   */
  async download(
    endpoint: string,
    filename?: string,
    config: RequestConfig = {}
  ): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.instance.get(endpoint, {
      ...config,
      responseType: 'blob',
    });
    
    // Trigger download if filename is provided
    if (filename) {
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
    return response.data;
  }

  /**
   * Invalidate cache entries related to an endpoint
   */
  private invalidateRelatedCache(endpoint: string, method: string): void {
    // Extract base resource from endpoint
    const resourceMatch = endpoint.match(/^\/([^\/]+)/);
    if (resourceMatch) {
      const resource = resourceMatch[1];
      apiCache.invalidate(new RegExp(`/${resource}`));
    }
    
    // For mutations, also invalidate common list endpoints
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Invalidate any list endpoints that might include this resource
      apiCache.invalidate(new RegExp(endpoint.split('/')[1] || ''));
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health', { cache: false });
  }

  /**
   * Get API instance for direct use
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    apiCache.clearAll();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return apiCache.getStats();
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

export default apiClient;