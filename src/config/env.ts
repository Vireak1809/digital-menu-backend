import path from 'node:path';
import { existsSync } from 'node:fs';
import * as dotenv from 'dotenv';
import { z } from 'zod';

const cwdEnvPath = path.resolve(process.cwd(), '.env');
const projectRootEnvPath = path.resolve(process.cwd(), '../.env');

const envPath = existsSync(cwdEnvPath)
  ? cwdEnvPath
  : existsSync(projectRootEnvPath)
    ? projectRootEnvPath
    : cwdEnvPath;

dotenv.config({ path: envPath });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('https://digital-menu-f143.onrender.com'),
  PUBLIC_BASE_URL: z.string().default('https://digital-menu-f143.onrender.com'),
  UPLOAD_DIR: z.string().default('uploads'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((s) => s.trim()),
  isProd: parsed.data.NODE_ENV === 'production',
};