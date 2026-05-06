import type { Context } from 'hono';
import { ERROR_CODES } from '@rogers-park/shared';

/**
 * Format successful API response
 */
export function successResponse<T>(c: Context, data: T, status = 200) {
  return c.json(
    {
      data,
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    },
    status
  );
}

/**
 * Format error API response
 */
export function errorResponse(
  c: Context,
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return c.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    },
    status
  );
}

/**
 * Map service errors to HTTP responses
 */
export function handleServiceError(c: Context, error: unknown) {
  if (error instanceof Error) {
    switch (error.message) {
      case 'EMAIL_TAKEN':
        return errorResponse(
          c,
          ERROR_CODES.EMAIL_TAKEN,
          'Email address is already registered',
          409
        );
      case 'INVALID_CREDENTIALS':
        return errorResponse(
          c,
          ERROR_CODES.INVALID_CREDENTIALS,
          'Invalid email or password',
          401
        );
      case 'NOT_AUTHENTICATED':
        return errorResponse(
          c,
          ERROR_CODES.NOT_AUTHENTICATED,
          'Authentication required',
          401
        );
      default:
        console.error('Unhandled error:', error);
        return errorResponse(
          c,
          ERROR_CODES.INTERNAL_ERROR,
          'An unexpected error occurred',
          500
        );
    }
  }

  console.error('Unknown error:', error);
  return errorResponse(
    c,
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected error occurred',
    500
  );
}
