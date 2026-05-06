import { z } from 'zod';
import { USER_ROLES, VALIDATION_CONSTRAINTS } from './constants';

/**
 * Signup request validation
 */
export const signupSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(
      VALIDATION_CONSTRAINTS.PASSWORD_MIN_LENGTH,
      `Password must be at least ${VALIDATION_CONSTRAINTS.PASSWORD_MIN_LENGTH} characters`
    ),
  display_name: z
    .string()
    .min(
      VALIDATION_CONSTRAINTS.DISPLAY_NAME_MIN_LENGTH,
      `Display name must be at least ${VALIDATION_CONSTRAINTS.DISPLAY_NAME_MIN_LENGTH} characters`
    )
    .max(
      VALIDATION_CONSTRAINTS.DISPLAY_NAME_MAX_LENGTH,
      `Display name must be at most ${VALIDATION_CONSTRAINTS.DISPLAY_NAME_MAX_LENGTH} characters`
    )
    .trim(),
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Login request validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * User role validation
 */
export const userRoleSchema = z.enum([
  USER_ROLES.USER,
  USER_ROLES.EDITOR,
  USER_ROLES.ADMIN,
]);
