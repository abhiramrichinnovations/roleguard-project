import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logout } from '../store/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true, // sends httpOnly cookies automatically on every request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // No request interceptor needed — the browser attaches the httpOnly
    // accessToken cookie to every request automatically. No JS-readable
    // token exists to attach manually, which is the point of httpOnly cookies.

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const { store } = await import('../store');

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise<void>((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          this.isRefreshing = true;
          originalRequest._retry = true;

          try {
            // Backend sets a fresh accessToken cookie on success — nothing to store client-side.
            await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

            this.failedQueue.forEach((prom) => prom.resolve());
            this.failedQueue = [];

            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach((prom) =>
              prom.reject(new Error('Token refresh failed'))
            );
            this.failedQueue = [];

            store.dispatch(logout());
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();