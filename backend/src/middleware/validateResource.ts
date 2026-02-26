import express, { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError, ZodIssue } from 'zod';

import AppError from '../utils/appError';

export const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e: ZodIssue) => e.message).join(', ');
        return next(new AppError(message, 400));
      }
      return next(new AppError('Invalid request', 400));
    }
  };
