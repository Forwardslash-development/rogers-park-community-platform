import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/connection';
import { users, emailVerificationTokens } from '../../src/db/schema';
import { EmailVerificationService } from '../../src/services/email-verification';
import { hashPassword } from '../../src/utils/password';
import { eq } from 'drizzle-orm';

describe('Email Verification Service', () => {
  const service = new EmailVerificationService();
  let testUserId: string;
  let testEmail: string;

  beforeEach(async () => {
    // Create unique email for each test
    testEmail = `verification${Date.now()}@test.com`;
    
    // Create a test user
    const [user] = await db
      .insert(users)
      .values({
        email: testEmail,
        password_hash: await hashPassword('TestPass123'),
        display_name: 'Verification Test',
      })
      .returning();
    
    testUserId = user.id;
  });

  describe('sendVerificationEmail', () => {
    it('should create a verification token', async () => {
      await service.sendVerificationEmail(testUserId, testEmail);

      const tokens = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, testUserId));

      expect(tokens).toHaveLength(1);
      expect(tokens[0].userId).toBe(testUserId);
    });

    it('should set token expiry to 24 hours from now', async () => {
      await service.sendVerificationEmail(testUserId, testEmail);

      const [token] = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, testUserId));

      const now = new Date();
      const diff = token.expiresAt.getTime() - now.getTime();
      const hours = diff / (1000 * 60 * 60);

      expect(hours).toBeGreaterThan(23.9);
      expect(hours).toBeLessThan(24.1);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      // Create a token manually (since we need the unhashed version)
      const token = 'test-verification-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      await db.insert(emailVerificationTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await service.verifyEmail(token);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified successfully');

      // Check user is marked as verified
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      expect(user.email_verified_at).not.toBeNull();
    });

    it('should reject invalid token', async () => {
      const result = await service.verifyEmail('invalid-token');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should reject expired token', async () => {
      const token = 'expired-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      // Create expired token (1 hour in the past)
      await db.insert(emailVerificationTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000),
      });

      const result = await service.verifyEmail(token);

      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should delete token after successful verification', async () => {
      const token = 'one-time-token';
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      await db.insert(emailVerificationTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await service.verifyEmail(token);

      // Token should be deleted
      const tokens = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, testUserId));

      expect(tokens).toHaveLength(0);
    });
  });

  describe('isEmailVerified', () => {
    it('should return false for unverified email', async () => {
      const isVerified = await service.isEmailVerified(testUserId);
      expect(isVerified).toBe(false);
    });

    it('should return true for verified email', async () => {
      // Mark as verified
      await db
        .update(users)
        .set({ email_verified_at: new Date() })
        .where(eq(users.id, testUserId));

      const isVerified = await service.isEmailVerified(testUserId);
      expect(isVerified).toBe(true);
    });
  });
});
