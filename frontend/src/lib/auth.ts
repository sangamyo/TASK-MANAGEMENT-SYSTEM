import api from './api';
import { setAccessToken } from './tokenStore';
import type { User } from '@/types';

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export const registerUser = async (input: { name: string; email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  setAccessToken(data.accessToken);
  return data;
};

export const loginUser = async (input: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  setAccessToken(data.accessToken);
  return data;
};

export const refreshSession = async (): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/refresh');
  setAccessToken(data.accessToken);
  return data;
};

export const logoutUser = async () => {
  await api.post('/auth/logout');
  setAccessToken(null);
};
