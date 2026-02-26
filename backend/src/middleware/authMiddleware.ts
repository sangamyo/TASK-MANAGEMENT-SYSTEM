import { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../utils/token';
import AppError from '../utils/appError';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, email: payload.email };
    return next();
  } catch {
    return next(new AppError('Unauthorized', 401));
  }
};
