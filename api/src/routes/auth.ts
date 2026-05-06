import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { signupSchema, loginSchema } from '@rogers-park/shared';
import { authService } from '@/services/auth';
import { successResponse, errorResponse, handleServiceError } from '@/utils/response';
import { ERROR_CODES } from '@rogers-park/shared';
import { setCookie } from 'hono/cookie';
import { SESSION_CONFIG } from '@rogers-park/shared';

const auth = new Hono();

/**
 * POST /auth/signup
 * Create a new user account
 */
auth.post(
  '/signup',
  zValidator('json', signupSchema, (result, c) => {
    if (!result.success) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed',
        400,
        { errors: result.error.flatten() }
      );
    }
  }),
  async (c) => {
    try {
      const input = c.req.valid('json');
      const { user, session, sessionCookie } = await authService.signup(input);

      // Set session cookie
      setCookie(c, sessionCookie.name, sessionCookie.value, {
        ...sessionCookie.attributes,
        httpOnly: true,
        secure: sessionCookie.attributes.secure,
        sameSite: 'Lax',
        maxAge: SESSION_CONFIG.MAX_AGE_SECONDS,
      });

      return successResponse(
        c,
        {
          user,
          session: {
            id: session.id,
            user_id: session.userId,
            expires_at: session.expiresAt,
          },
        },
        201
      );
    } catch (error) {
      return handleServiceError(c, error);
    }
  }
);

/**
 * POST /auth/login
 * Log in with email and password
 */
auth.post(
  '/login',
  zValidator('json', loginSchema, (result, c) => {
    if (!result.success) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Validation failed',
        400,
        { errors: result.error.flatten() }
      );
    }
  }),
  async (c) => {
    try {
      const input = c.req.valid('json');
      const { user, session, sessionCookie } = await authService.login(input);

      // Set session cookie
      setCookie(c, sessionCookie.name, sessionCookie.value, {
        ...sessionCookie.attributes,
        httpOnly: true,
        secure: sessionCookie.attributes.secure,
        sameSite: 'Lax',
        maxAge: SESSION_CONFIG.MAX_AGE_SECONDS,
      });

      return successResponse(
        c,
        {
          user,
          session: {
            id: session.id,
            user_id: session.userId,
            expires_at: session.expiresAt,
          },
        },
        200
      );
    } catch (error) {
      return handleServiceError(c, error);
    }
  }
);

export default auth;
