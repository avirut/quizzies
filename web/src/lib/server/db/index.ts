import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const DB_PATH = process.env.DATABASE_URL || 'file:src/lib/server/db/quizzies.db';

const client = createClient({
  url: DB_PATH
});

export const db = drizzle(client, { schema });