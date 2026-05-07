/**
 * Shared constants for Rogers Park Community Platform
 */

export const USER_ROLES = {
  USER: 'user',
  EDITOR: 'editor',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ERROR_CODES = {
  // Auth errors
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const SESSION_CONFIG = {
  COOKIE_NAME: 'session',
  MAX_AGE_SECONDS: 2592000, // 30 days
  EXPIRES_IN_MS: 2592000 * 1000,
} as const;

export const VALIDATION_CONSTRAINTS = {
  PASSWORD_MIN_LENGTH: 8,
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 100,
} as const;

/**
 * Event source types
 * Defines where event data originates from
 */
export const EVENT_SOURCES = {
  NATIVE: 'native',      // Created directly in the platform
  SCRAPED: 'scraped',    // Scraped from external sources
  SUBMITTED: 'submitted', // User-submitted events
} as const;

export type EventSource = (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES];

/**
 * Common place categories/tags
 * Used for categorizing venues and locations
 */
export const PLACE_TAGS = [
  'restaurant',
  'bar',
  'cafe',
  'park',
  'gallery',
  'theater',
  'music-venue',
  'community-center',
  'library',
  'school',
  'church',
  'mosque',
  'temple',
  'gym',
  'store',
  'market',
  'playground',
  'garden',
  'beach',
  'sports-facility',
] as const;

export type PlaceTag = (typeof PLACE_TAGS)[number];

/**
 * Common event categories/tags
 * Used for categorizing events
 */
export const EVENT_TAGS = [
  'music',
  'art',
  'theater',
  'film',
  'food',
  'community',
  'sports',
  'education',
  'kids',
  'free',
  'outdoor',
  'indoor',
  'workshop',
  'festival',
  'market',
  'performance',
  'exhibition',
  'lecture',
  'meetup',
  'social',
] as const;

export type EventTag = (typeof EVENT_TAGS)[number];

/**
 * Accessibility features
 * Used to describe accessibility accommodations
 */
export const ACCESSIBILITY_FEATURES = [
  'wheelchair-accessible',
  'accessible-parking',
  'accessible-restroom',
  'elevator',
  'ramp',
  'asl-interpretation',
  'closed-captioning',
  'service-animals-welcome',
  'braille',
  'audio-description',
  'low-sensory',
  'quiet-room',
] as const;

export type AccessibilityFeature = (typeof ACCESSIBILITY_FEATURES)[number];

/**
 * Validation limits for content fields
 */
export const VALIDATION_LIMITS = {
  // Slugs
  SLUG_MIN_LENGTH: 1,
  SLUG_MAX_LENGTH: 255,
  
  // Names
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 255,
  
  // Descriptions
  DESCRIPTION_MAX_LENGTH: 5000,
  
  // Tags
  MAX_TAGS: 10,
  
  // URLs
  URL_MAX_LENGTH: 1000,
  
  // Addresses
  ADDRESS_MAX_LENGTH: 500,
} as const;
