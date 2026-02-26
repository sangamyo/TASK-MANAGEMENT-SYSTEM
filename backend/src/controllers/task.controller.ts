import { Request, Response } from 'express';

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  toggleTask,
  updateTask,
} from '../services/task.service';
import { asyncHandler } from '../utils/asyncHandler';

type TaskQuery = {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
};

export const getTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getTasks(req.user!.id, req.query as TaskQuery);
    res.json(result);
  },
);

export const getTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await getTaskById(req.user!.id, req.params.id);
    res.json(task);
  },
);

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await createTask(req.user!.id, req.body);
    res.status(201).json(task);
  },
);

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await updateTask(req.user!.id, req.params.id, req.body);
    res.json(task);
  },
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteTask(req.user!.id, req.params.id);
    res.status(204).send();
  },
);

export const toggleTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await toggleTask(req.user!.id, req.params.id);
    res.json(task);
  },
);
