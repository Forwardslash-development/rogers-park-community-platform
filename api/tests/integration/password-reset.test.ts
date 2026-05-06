import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/connection';
import { users, passwordResetTokens } from '../../src/db/schema';
import { PasswordResetService } from '../../src/services/password-reset';
import { hashPassword, verifyPassword } from '../../src/utils/password';
import { eq } from 'drizzle-orm';

describe('Password Reset Service', () => {
  const service = new PasswordResetService();
  let testUserId: string;
  let testEmail: string;

  beforeEach(async () => {
    testEmail = `reset${Date.now()}@test.com`;
    
    // Create a test user
    const [user] = await db
      .insert(users)
      .values({
        email: testEmail,
        password_hash: await hashPassword('OldPassword123'),
        display_name: 'Reset Test',
      })
      .returning();
    
    testUserId = user.id;
  });

  describe('requestPasswordReset', () => {
    it('should create a password reset token for existing user', async () => {
      const result = await service.requestPasswordReset(testEmail);

      expect(result.success).toBe(true);

      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUserId));

      expect(tokens).toHaveLength(1);
    });

    it('should set token expiry to 1 hour from now', async () => {
      await service.requestPasswordReset(testEmail);

      const [token] = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUserId));

      const now = new Date();
      const diff = token.expiresAt.getTime() - now.getTime();
      const hours = diff / (1000 * 60 * 60);

      expect(hours).toBeGreaterThan(0.9);
      expect(hours).toBeLessThan(1.1);
    });

    it('should return success even for non-existent email (security)', async () => {
      const result = await service.requestPasswordReset('nonexistent@test.com');

      expect(result.success).toBe(true);
      expect(result.message).toContain('If that email exists');
    });

    it('should delete old tokens when requesting new one', async () => {
      // Request first reset
      await service.requestPasswordReset(testEmail);
      
      // Request second reset
      await service.requestPasswordReset(testEmail);

      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUserId));

      // Should only have 1 token (the new one)
      expect(tokens).toHaveLength(1);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      const result = await service.resetPassword(token, 'NewPassword456');

      expect(result.success).toBe(true);

      // Verify new password works
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      const passwordValid = await verifyPassword('NewPassword456', user.password_hash);
      expect(passwordValid).toBe(true);
    });

    it('should reject invalid token', async () => {
      const result = await service.resetPassword('invalid-token', 'NewPassword456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should reject expired token', async () => {
      const token = 'expired-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      });

      const result = await service.resetPassword(token, 'NewPassword456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should delete token after successful reset', async () => {
      const token = 'one-time-reset-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      await service.resetPassword(token, 'NewPassword456');

      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUserId));

      expect(tokens).toHaveLength(0);
    });
  });

  describe('validateResetToken', () => {
    it('should return true for valid token', async () => {
      const token = 'valid-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      const isValid = await service.validateResetToken(token);
      expect(isValid).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const isValid = await service.validateResetToken('invalid-token');
      expect(isValid).toBe(false);
    });

    it('should return false for expired token', async () => {
      const token = 'expired-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000),
      });

      const isValid = await service.validateResetToken(token);
      expect(isValid).toBe(false);
    });
  });
});
