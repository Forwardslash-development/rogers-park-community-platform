import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/app';
import { db } from '../../src/db/connection';
import { users, passwordResetTokens } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('Password Reset Endpoints', () => {
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

  describe('POST /api/v1/auth/request-password-reset', () => {
    it('creates password reset token for existing user', async () => {
      const response = await app.request('/api/v1/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.message).toContain('password reset');

      // Check token was created
      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUserId));

      expect(tokens).toHaveLength(1);
    });

    it('returns success even for non-existent email (security)', async () => {
      const response = await app.request('/api/v1/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'nonexistent@test.com' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.message).toContain('password reset');
    });

    it('deletes old tokens before creating new one', async () => {
      // Request first reset
      await app.request('/api/v1/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      // Request second reset
      await app.request('/api/v1/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      // Should only have 1 token
      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUserId));

      expect(tokens).toHaveLength(1);
    });

    it('requires email in request body', async () => {
      const response = await app.request('/api/v1/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message.toLowerCase()).toContain('email');
    });

    it('validates email format', async () => {
      const response = await app.request('/api/v1/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'not-an-email' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('resets password with valid token', async () => {
      // Generate token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      const response = await app.request('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: 'NewPassword123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.message).toContain('reset');

      // Check password was updated
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      const passwordValid = await verifyPassword('NewPassword123', user.password_hash);
      expect(passwordValid).toBe(true);

      // Check old password no longer works
      const oldPasswordValid = await verifyPassword('OldPassword123', user.password_hash);
      expect(oldPasswordValid).toBe(false);
    });

    it('rejects invalid token', async () => {
      const response = await app.request('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'invalid-token',
          newPassword: 'NewPassword123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('Invalid');
    });

    it('rejects expired token', async () => {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // Expired
      });

      const response = await app.request('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: 'NewPassword123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('expired');
    });

    it('deletes token after successful reset', async () => {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      await app.request('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: 'NewPassword123',
        }),
      });

      // Token should be deleted
      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUserId));

      expect(tokens).toHaveLength(0);
    });

    it('requires token and newPassword', async () => {
      const response = await app.request('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });

    it('validates password strength', async () => {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      const response = await app.request('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: 'weak',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/validate-reset-token/:token', () => {
    it('returns valid for existing non-expired token', async () => {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      const response = await app.request(`/api/v1/auth/validate-reset-token/${token}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.valid).toBe(true);
    });

    it('returns invalid for non-existent token', async () => {
      const response = await app.request('/api/v1/auth/validate-reset-token/invalid-token', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.valid).toBe(false);
    });

    it('returns invalid for expired token', async () => {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(passwordResetTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // Expired
      });

      const response = await app.request(`/api/v1/auth/validate-reset-token/${token}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.valid).toBe(false);
    });
  });
});
