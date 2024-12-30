import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { resolve } from 'node:path';
import * as schema from './schema';

const DB_PATH = process.env.DATABASE_URL || 'src/lib/server/db/quizzies.db';

const sqlite = new Database(resolve(DB_PATH));

export const db = drizzle(sqlite, { schema });