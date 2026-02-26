import express, { Router } from 'express';

import {
  createTaskController,
  deleteTaskController,
  getTaskController,
  getTasksController,
  toggleTaskController,
  updateTaskController,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/authMiddleware';
import { validateResource } from '../middleware/validateResource';
import {
  createTaskSchema,
  taskQuerySchema,
  toggleTaskSchema,
  updateTaskSchema,
} from '../types/task';

const router = express.Router();

router.use(authenticate);

router.get('/', validateResource(taskQuerySchema), getTasksController);
router.post('/', validateResource(createTaskSchema), createTaskController);
router.get('/:id', validateResource(toggleTaskSchema), getTaskController);
router.patch('/:id', validateResource(updateTaskSchema), updateTaskController);
router.delete('/:id', validateResource(toggleTaskSchema), deleteTaskController);
router.patch(
  '/:id/toggle',
  validateResource(toggleTaskSchema),
  toggleTaskController,
);

export default router;
