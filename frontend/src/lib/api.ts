import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';
import type { User } from '@/types';

const rawApiBase = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend.onrender.com';
const baseURL = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

const createClient = (): AxiosInstance =>
  axios.create({
    baseURL,
    withCredentials: true,
  });

export const api = createClient();
const authClient = createClient();

let isRefreshing = false;
const queue: Array<(token: string | null) => void> = [];
let onAuthRefresh: ((payload: { user: User; accessToken: string }) => void) | null = null;

export const registerAuthRefreshHandler = (
  handler: (payload: { user: User; accessToken: string }) => void,
) => {
  onAuthRefresh = handler;
};

const processQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue.length = 0;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    type RetryableRequest = AxiosRequestConfig & { _retry?: boolean };
    const originalRequest = error.config as RetryableRequest;
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const isRefreshRequest = (originalRequest?.url as string | undefined)?.includes('/auth/refresh');

    if (status === 401 && !originalRequest?._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (!token) return reject(error);
            if (!originalRequest?.headers) originalRequest.headers = {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
  type RefreshResponse = { user: User; accessToken: string };
  const { data } = await authClient.post<RefreshResponse>('/auth/refresh');
  const token = data.accessToken;
  setAccessToken(token);
  onAuthRefresh?.(data);
        processQueue(token);
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        processQueue(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
