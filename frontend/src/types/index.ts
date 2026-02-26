export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: boolean;
  createdAt: string;
  userId: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
