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
