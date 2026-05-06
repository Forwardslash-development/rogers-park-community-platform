import { type UserRole } from './constants';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  email_verified_at: Date | null;
}

/**
 * User without sensitive fields (for API responses)
 */
export type PublicUser = Omit<User, 'email_verified_at'>;

/**
 * Session entity
 */
export interface Session {
  id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

/**
 * Auth response (signup/login)
 */
export interface AuthResponse {
  user: PublicUser;
  session: Session;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta: {
    version: string;
    timestamp: string;
  };
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    version: string;
    timestamp: string;
  };
}
