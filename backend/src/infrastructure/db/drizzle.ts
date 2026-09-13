import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Infrastructure concern: creates and exports the Drizzle DB client.
 *
 * This module is the ONLY place that reads DATABASE_URL.
 * It must never be imported by domain or application layers.
 */
function createDrizzleClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Copy .env.example to .env and fill it in.',
    );
  }

  const queryClient = postgres(url, {
    max: 10, // connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(queryClient, { schema });
}

export type DrizzleDb = ReturnType<typeof createDrizzleClient>;

/** Singleton DB client — initialised once at startup in container.ts. */
export const db = createDrizzleClient();
