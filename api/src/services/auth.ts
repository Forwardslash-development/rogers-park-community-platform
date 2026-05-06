import { db } from '@/db/connection';
import { users } from '@/db/schema';
import { lucia } from '@/db/lucia';
import { hashPassword } from '@/utils/password';
import { eq } from 'drizzle-orm';
import type { SignupInput } from '@rogers-park/shared';
import { USER_ROLES } from '@rogers-park/shared';

export class AuthService {
  /**
   * Sign up a new user
   */
  async signup(input: SignupInput) {
    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()));

    if (existingUser) {
      throw new Error('EMAIL_TAKEN');
    }

    // Hash password
    const password_hash = await hashPassword(input.password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        password_hash,
        display_name: input.display_name,
        role: USER_ROLES.USER,
      })
      .returning();

    if (!newUser) {
      throw new Error('USER_CREATION_FAILED');
    }

    // Create session
    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name,
        role: newUser.role,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      },
      session,
      sessionCookie,
    };
  }

  /**
   * Validate session from session ID
   */
  async validateSession(sessionId: string) {
    const result = await lucia.validateSession(sessionId);
    return result;
  }

  /**
   * Invalidate (logout) a session
   */
  async invalidateSession(sessionId: string) {
    await lucia.invalidateSession(sessionId);
  }
}

export const authService = new AuthService();
