import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from './connection';
import { users, sessions } from './schema';
import type { User as DbUser } from './schema';

// Create Drizzle adapter for Lucia
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// Initialize Lucia
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      display_name: attributes.display_name,
      role: attributes.role,
      created_at: attributes.created_at,
      updated_at: attributes.updated_at,
    };
  },
});

// Type declarations for Lucia
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  display_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}
