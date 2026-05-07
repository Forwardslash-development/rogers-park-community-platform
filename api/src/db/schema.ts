import { pgTable, uuid, varchar, timestamp, text, boolean, jsonb, customType } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { USER_ROLES } from '@rogers-park/shared';

/**
 * Custom PostGIS geometry column type helper
 */
const geometryColumn = (name: string, geometryType: string, srid: number = 4326) =>
  customType<{ data: string }>({
    dataType() {
      return `geometry(${geometryType}, ${srid})`;
    },
  })(name);

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

/**
 * Email verification tokens
 */
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Password reset tokens
 */
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Places - venues, parks, restaurants, galleries, civic spaces
 * Uses PostGIS geometry for spatial queries
 */
export const places = pgTable('places', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: varchar('address', { length: 500 }),
  website: varchar('website', { length: 500 }),
  phone: varchar('phone', { length: 50 }),
  // PostGIS geometry column - stores point location (latitude/longitude)
  // Using geometry(Point, 4326) for WGS84 coordinate system
  geometry: geometryColumn('geometry', 'Point').notNull(),
  // JSON array of tags for flexible categorization
  tags: jsonb('tags').$type<string[]>().default(sql`'[]'::jsonb`),
  // Operating hours as JSON (can be structured later)
  hours: jsonb('hours').$type<Record<string, unknown>>(),
  // Accessibility metadata
  accessibility: jsonb('accessibility').$type<Record<string, unknown>>(),
  // External references
  osm_id: varchar('osm_id', { length: 100 }),
  google_place_id: varchar('google_place_id', { length: 255 }),
  // Claim status for community editing
  is_claimed: boolean('is_claimed').default(false),
  claimed_by: uuid('claimed_by').references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Organizers - people, groups, institutions that run events
 * Separate from Places because one organizer can host events at multiple locations
 */
export const organizers = pgTable('organizers', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  website: varchar('website', { length: 500 }),
  email: varchar('email', { length: 255 }),
  // Social media handles
  social_links: jsonb('social_links').$type<Record<string, string>>(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Events - ephemeral happenings at places
 * Uses RRULE for recurrence, explicit source tracking
 */
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  place_id: uuid('place_id')
    .notNull()
    .references(() => places.id, { onDelete: 'cascade' }),
  organizer_id: uuid('organizer_id')
    .notNull()
    .references(() => organizers.id, { onDelete: 'cascade' }),
  // Event timing
  starts_at: timestamp('starts_at', { withTimezone: true }).notNull(),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  // Recurrence rule (RFC 5545 RRULE format)
  rrule: varchar('rrule', { length: 500 }),
  // Source tracking: 'native' (created here), 'scraped' (external), 'submitted' (user submission)
  source: varchar('source', { length: 50 }).notNull(),
  source_url: varchar('source_url', { length: 1000 }),
  // Event metadata
  tags: jsonb('tags').$type<string[]>().default(sql`'[]'::jsonb`),
  price: varchar('price', { length: 100 }), // Free, $10, $5-$15, etc.
  registration_url: varchar('registration_url', { length: 1000 }),
  accessibility: jsonb('accessibility').$type<Record<string, unknown>>(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Subareas - Rogers Park micro-neighborhoods
 * Uses PostGIS polygons for point-in-polygon queries
 */
export const subareas = pgTable('subareas', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  // PostGIS geometry column - stores polygon boundary
  geometry: geometryColumn('geometry', 'Polygon').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Additional type exports for new tables
export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Organizer = typeof organizers.$inferSelect;
export type NewOrganizer = typeof organizers.$inferInsert;
export type Subarea = typeof subareas.$inferSelect;
export type NewSubarea = typeof subareas.$inferInsert;
