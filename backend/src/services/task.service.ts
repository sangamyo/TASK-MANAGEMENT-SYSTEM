import prisma from '../prisma/client';
import AppError from '../utils/appError';
import { CreateTaskInput, UpdateTaskInput } from '../types/task';

export const createTask = async (userId: string, data: CreateTaskInput) => {
  return prisma.task.create({
    data: { ...data, userId },
  });
};

export const getTasks = async (
  userId: string,
  options: { page?: string; limit?: string; status?: string; search?: string },
) => {
  const page = Math.max(parseInt(options.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(options.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };

  if (options.status) {
    where.status = options.status === 'true';
  }

  if (options.search) {
    where.title = { contains: options.search, mode: 'insensitive' };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data: tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getTaskById = async (userId: string, id: string) => {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
};

export const updateTask = async (
  userId: string,
  id: string,
  data: UpdateTaskInput,
) => {
  await getTaskById(userId, id);
  return prisma.task.update({ where: { id }, data });
};

export const deleteTask = async (userId: string, id: string) => {
  await getTaskById(userId, id);
  await prisma.task.delete({ where: { id } });
};

export const toggleTask = async (userId: string, id: string) => {
  const task = await getTaskById(userId, id);
  return prisma.task.update({
    where: { id },
    data: { status: !task.status },
  });
};
