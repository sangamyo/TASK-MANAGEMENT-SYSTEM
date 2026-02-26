import { NextFunction, Request, Response } from 'express';

import AppError from '../utils/appError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  let customError = err;

  if (!(err instanceof AppError)) {
    customError = new AppError('Something went wrong', 500, false);
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const { statusCode, message } = customError as AppError;
  res.status(statusCode || 500).json({ message });
};

export default errorHandler;
