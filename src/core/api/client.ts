/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import * as SecureStore from 'expo-secure-store';
import { StorageService } from '../storage/mmkv';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Pointing to Android Emulator's host machine (Local Backend)
const BASE_URL = 'http://10.0.2.2:8080';

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          const tenantId = StorageService.getString('tenant_id');

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Automatically append tenantId context to all requests
          if (tenantId) {
            if (config.method === 'get') {
              config.params = { ...config.params, tenantId };
            } else {
              // For POST/PUT, the backend might handle it via token or body, 
              // but we'll add a header for good measure
              config.headers['X-Tenant-Id'] = tenantId;
            }
          }
        } catch (error) {
          console.error('Error in request interceptor', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired logic
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get<T>(url, config).then((res) => res.data);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post<T>(url, data, config).then((res) => res.data);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put<T>(url, data, config).then((res) => res.data);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete<T>(url, config).then((res) => res.data);
  }
}

export default ApiClient.getInstance();




