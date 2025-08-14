
import api from '@/lib/api';
import { AxiosResponse } from 'axios';

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic CRUD service class
class ApiService {
  // GET request
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response: AxiosResponse<T> = await api.get(endpoint, { params });
    return response.data;
  }

  // POST request
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await api.post(endpoint, data);
    return response.data;
  }

  // PUT request
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await api.put(endpoint, data);
    return response.data;
  }

  // PATCH request
  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await api.patch(endpoint, data);
    return response.data;
  }

  // DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    const response: AxiosResponse<T> = await api.delete(endpoint);
    return response.data;
  }

  // Upload file
  static async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response: AxiosResponse<T> = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default ApiService;
export const apiService = ApiService;
