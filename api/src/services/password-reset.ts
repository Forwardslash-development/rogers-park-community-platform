import { db } from '../db/connection';
import { users, passwordResetTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken, hashToken, createTokenExpiry } from '../utils/tokens';
import { emailService, emailTemplates } from './email';
import { hashPassword } from '../utils/password';

export class PasswordResetService {
  /**
   * Request password reset - send email with reset token
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success message (don't reveal if email exists)
    if (!user) {
      return {
        success: true,
        message: 'If that email exists, a password reset link has been sent',
      };
    }

    // Generate token (1 hour expiry for password resets)
    const token = generateToken();
    const hashedToken = hashToken(token);
    const expiresAt = createTokenExpiry(1); // 1 hour

    // Delete any existing tokens for this user
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    // Store new token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: hashedToken,
      expiresAt,
    });

    // Send email
    const emailOptions = emailTemplates.passwordResetEmail(email, token);
    await emailService.sendEmail(emailOptions);

    return {
      success: true,
      message: 'If that email exists, a password reset link has been sent',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const hashedToken = hashToken(token);

    // Find token in database
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, hashedToken))
      .limit(1);

    if (!tokenRecord) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Delete expired token
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, tokenRecord.id));

      return { success: false, message: 'Invalid or expired reset token' };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user's password
    await db
      .update(users)
      .set({ password_hash: passwordHash })
      .where(eq(users.id, tokenRecord.userId));

    // Delete used token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return { success: true, message: 'Password reset successfully' };
  }

  /**
   * Validate reset token (check if it exists and is not expired)
   */
  async validateResetToken(token: string): Promise<boolean> {
    const hashedToken = hashToken(token);

    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, hashedToken))
      .limit(1);

    if (!tokenRecord) {
      return false;
    }

    if (new Date() > tokenRecord.expiresAt) {
      return false;
    }

    return true;
  }
}

export const passwordResetService = new PasswordResetService();
