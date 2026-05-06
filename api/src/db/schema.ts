import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { USER_ROLES } from '@rogers-park/shared';

/**
 * Users table
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  display_name: varchar('display_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default(USER_ROLES.USER),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  email_verified_at: timestamp('email_verified_at'),
});

/**
 * Sessions table (Lucia)
 * IMPORTANT: Lucia adapter expects camelCase property names
 */
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
