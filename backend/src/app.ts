import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env';
import errorHandler from './middleware/errorHandler';
import routes from './routes';
import AppError from './utils/appError';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req: Request, res: Response) =>
  res.json({ status: 'ok' }),
);

app.use('/api', routes);

app.use('*', (_req: Request, _res: Response, next: NextFunction) =>
  next(new AppError('Route not found', 404)),
);

app.use(errorHandler);

export default app;
