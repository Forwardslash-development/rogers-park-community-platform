import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { signupSchema, loginSchema } from '@rogers-park/shared';
import { authService } from '@/services/auth';
import { successResponse, errorResponse, handleServiceError } from '@/utils/response';
import { ERROR_CODES } from '@rogers-park/shared';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
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

/**
 * POST /auth/logout
 * Log out and invalidate session
 */
auth.post('/logout', async (c) => {
  try {
    const sessionId = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

    if (!sessionId) {
      return errorResponse(
        c,
        ERROR_CODES.NOT_AUTHENTICATED,
        'Not authenticated',
        401
      );
    }

    // Invalidate session in database
    await authService.invalidateSession(sessionId);

    // Delete session cookie
    deleteCookie(c, SESSION_CONFIG.COOKIE_NAME);

    return successResponse(c, {
      message: 'Logged out successfully',
    });
  } catch (error) {
    return handleServiceError(c, error);
  }
});

/**
 * GET /auth/user
 * Get current authenticated user
 */
auth.get('/user', async (c) => {
  try {
    const sessionId = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

    if (!sessionId) {
      return errorResponse(
        c,
        ERROR_CODES.NOT_AUTHENTICATED,
        'Not authenticated',
        401
      );
    }

    // Validate session and get user
    const { session, user } = await authService.validateSession(sessionId);

    if (!session || !user) {
      return errorResponse(
        c,
        ERROR_CODES.NOT_AUTHENTICATED,
        'Session expired or invalid',
        401
      );
    }

    return successResponse(c, {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    return handleServiceError(c, error);
  }
});

export default auth;

/**
 * POST /auth/send-verification-email
 * Send verification email to authenticated user
 */
auth.post('/send-verification-email', async (c) => {
  try {
    const sessionId = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

    if (!sessionId) {
      return errorResponse(
        c,
        ERROR_CODES.NOT_AUTHENTICATED,
        'Not authenticated',
        401
      );
    }

    // Validate session and get user
    const { user } = await authService.validateSession(sessionId);

    if (!user) {
      return errorResponse(
        c,
        ERROR_CODES.NOT_AUTHENTICATED,
        'Session expired or invalid',
        401
      );
    }

    const { emailVerificationService } = await import('@/services/email-verification');
    await emailVerificationService.sendVerificationEmail(user.id, user.email);

    return successResponse(c, {
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    return handleServiceError(c, error);
  }
});

/**
 * POST /auth/verify-email
 * Verify email with token
 */
auth.post('/verify-email', async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    if (!token) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Token is required',
        400
      );
    }

    const { emailVerificationService } = await import('@/services/email-verification');
    const result = await emailVerificationService.verifyEmail(token);

    if (!result.success) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        result.message,
        400
      );
    }

    return successResponse(c, {
      message: result.message,
    });
  } catch (error) {
    return handleServiceError(c, error);
  }
});

/**
 * POST /auth/request-password-reset
 * Request a password reset email
 */
auth.post('/request-password-reset', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Email is required',
        400
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid email format',
        400
      );
    }

    const { passwordResetService } = await import('@/services/password-reset');
    await passwordResetService.requestPasswordReset(email);

    // Always return success (don't reveal if email exists)
    return successResponse(c, {
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error) {
    return handleServiceError(c, error);
  }
});

/**
 * POST /auth/reset-password
 * Reset password with token
 */
auth.post('/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Token and new password are required',
        400
      );
    }

    // Validate password strength (min 8 chars)
    if (newPassword.length < 8) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Password must be at least 8 characters',
        400
      );
    }

    const { passwordResetService } = await import('@/services/password-reset');
    const result = await passwordResetService.resetPassword(token, newPassword);

    if (!result.success) {
      return errorResponse(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        result.message,
        400
      );
    }

    return successResponse(c, {
      message: result.message,
    });
  } catch (error) {
    return handleServiceError(c, error);
  }
});

/**
 * GET /auth/validate-reset-token/:token
 * Check if password reset token is valid
 */
auth.get('/validate-reset-token/:token', async (c) => {
  try {
    const token = c.req.param('token');

    const { passwordResetService } = await import('@/services/password-reset');
    const isValid = await passwordResetService.validateResetToken(token);

    return successResponse(c, {
      valid: isValid,
    });
  } catch (error) {
    return handleServiceError(c, error);
  }
});
