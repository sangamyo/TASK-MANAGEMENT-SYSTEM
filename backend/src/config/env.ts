import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  COOKIE_NAME: z.string().default('task_manager_session'),
  COOKIE_SECURE: z
    .enum(['true', 'false', '1', '0'])
    .default('false')
    .transform((val) => ['true', '1'].includes(val)),
});

const env = envSchema.parse(process.env);

export default env;
