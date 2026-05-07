import { z } from 'zod';
import {
  EVENT_SOURCES,
  PLACE_TAGS,
  EVENT_TAGS,
  ACCESSIBILITY_FEATURES,
  VALIDATION_LIMITS,
  VALIDATION_CONSTRAINTS,
} from './constants';

/**
 * Zod validation schemas for Rogers Park Community Platform
 * These schemas validate input data before database operations
 */

// Helper schemas
const slugSchema = z
  .string()
  .min(VALIDATION_LIMITS.SLUG_MIN_LENGTH)
  .max(VALIDATION_LIMITS.SLUG_MAX_LENGTH)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

const urlSchema = z.string().url().max(VALIDATION_LIMITS.URL_MAX_LENGTH);

const uuidSchema = z.string().uuid();

// Place schemas
export const createPlaceSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME_MIN_LENGTH)
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH),
  slug: slugSchema,
  address: z.string().max(VALIDATION_LIMITS.ADDRESS_MAX_LENGTH).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  tags: z
    .array(z.enum(PLACE_TAGS as [string, ...string[]]))
    .max(VALIDATION_LIMITS.MAX_TAGS)
    .optional(),
  description: z.string().max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH).optional(),
  accessibility: z
    .array(z.enum(ACCESSIBILITY_FEATURES as [string, ...string[]]))
    .optional(),
  hours: z.record(z.string()).optional(),
  website: urlSchema.optional(),
  phone: z.string().optional(),
  osm_id: z.string().optional(),
  google_place_id: z.string().optional(),
});

export const updatePlaceSchema = createPlaceSchema.partial();

// Event schemas - base schema without refinement
const baseEventSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME_MIN_LENGTH)
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH),
  slug: slugSchema,
  description: z.string().max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH).optional(),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date().optional(),
  place_id: uuidSchema.optional(),
  organizer_id: uuidSchema.optional(),
  source: z.enum([
    EVENT_SOURCES.NATIVE,
    EVENT_SOURCES.SCRAPED,
    EVENT_SOURCES.SUBMITTED,
  ] as [string, ...string[]]),
  source_url: urlSchema.optional(),
  tags: z
    .array(z.enum(EVENT_TAGS as [string, ...string[]]))
    .max(VALIDATION_LIMITS.MAX_TAGS)
    .optional(),
  price: z.string().optional(),
  registration_url: urlSchema.optional(),
  accessibility: z
    .array(z.enum(ACCESSIBILITY_FEATURES as [string, ...string[]]))
    .optional(),
  rrule: z.string().optional(),
});

// Add refinement for create
export const createEventSchema = baseEventSchema.refine(
  (data) => {
    if (data.ends_at && data.starts_at) {
      return data.ends_at > data.starts_at;
    }
    return true;
  },
  {
    message: 'ends_at must be after starts_at',
    path: ['ends_at'],
  }
);

// Update schema is partial of base, then add refinement
export const updateEventSchema = baseEventSchema.partial().refine(
  (data) => {
    if (data.ends_at && data.starts_at) {
      return data.ends_at > data.starts_at;
    }
    return true;
  },
  {
    message: 'ends_at must be after starts_at',
    path: ['ends_at'],
  }
);

// Organizer schemas
export const createOrganizerSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME_MIN_LENGTH)
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH),
  slug: slugSchema,
  description: z.string().max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH).optional(),
  email: z.string().email().optional(),
  website: urlSchema.optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
});

export const updateOrganizerSchema = createOrganizerSchema.partial();

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z
    .string()
    .min(VALIDATION_CONSTRAINTS.DISPLAY_NAME_MIN_LENGTH)
    .max(VALIDATION_CONSTRAINTS.DISPLAY_NAME_MAX_LENGTH),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Type exports (inferred from schemas)
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateOrganizerInput = z.infer<typeof createOrganizerSchema>;
export type UpdateOrganizerInput = z.infer<typeof updateOrganizerSchema>;

// Auth type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
