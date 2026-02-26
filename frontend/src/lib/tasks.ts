import api from './api';
import type { PaginatedResponse, Task } from '@/types';

export type TaskQuery = {
  page?: number;
  limit?: number;
  status?: 'true' | 'false';
  search?: string;
};

export const fetchTasks = async (query: TaskQuery = {}): Promise<PaginatedResponse<Task>> => {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);

  const { data } = await api.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`);
  return data;
};

export const createTask = async (input: { title: string; description?: string }) => {
  const { data } = await api.post<Task>('/tasks', input);
  return data;
};

export const updateTask = async (id: string, input: Partial<Pick<Task, 'title' | 'description' | 'status'>>) => {
  const { data } = await api.patch<Task>(`/tasks/${id}`, input);
  return data;
};

export const deleteTask = async (id: string) => {
  await api.delete(`/tasks/${id}`);
};

export const toggleTask = async (id: string) => {
  const { data } = await api.patch<Task>(`/tasks/${id}/toggle`);
  return data;
};
