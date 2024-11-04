import dotenv from 'dotenv';

import { defineConfig } from 'drizzle-kit';
dotenv.config({
  path: './.env.local',
});

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});