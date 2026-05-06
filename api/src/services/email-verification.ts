import { db } from '../db/connection';
import { users, emailVerificationTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken, hashToken, createTokenExpiry } from '../utils/tokens';
import { emailService, emailTemplates } from './email';

export class EmailVerificationService {
  /**
   * Create and send verification email
   */
  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    // Delete any existing tokens for this user first
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId));

    // Generate token
    const token = generateToken();
    const hashedToken = hashToken(token);
    const expiresAt = createTokenExpiry(24); // 24 hours

    // Store hashed token in database
    await db.insert(emailVerificationTokens).values({
      userId,
      token: hashedToken,
      expiresAt,
    });

    // Send email with plain token
    const emailOptions = emailTemplates.verificationEmail(email, token);
    await emailService.sendEmail(emailOptions);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const hashedToken = hashToken(token);

    // Find token in database
    const [tokenRecord] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, hashedToken))
      .limit(1);

    if (!tokenRecord) {
      return { success: false, message: 'Invalid verification token' };
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Delete expired token
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, tokenRecord.id));
      
      return { success: false, message: 'Verification token has expired' };
    }

    // Mark email as verified
    await db
      .update(users)
      .set({ email_verified_at: new Date() })
      .where(eq(users.id, tokenRecord.userId));

    // Delete used token
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, tokenRecord.id));

    return { success: true, message: 'Email verified successfully' };
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const [user] = await db
      .select({ email_verified_at: users.email_verified_at })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user?.email_verified_at !== null;
  }
}

export const emailVerificationService = new EmailVerificationService();
