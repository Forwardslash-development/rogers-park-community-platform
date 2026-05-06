import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/app';
import { db } from '../../src/db/connection';
import { users, emailVerificationTokens } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Email Verification Endpoints', () => {
  let testUserId: string;
  let testEmail: string;
  let sessionCookie: string;

  beforeEach(async () => {
    testEmail = `verify${Date.now()}@test.com`;

    // Create and login a test user
    const signupResponse = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPass123',
        display_name: 'Verify Test',
      }),
    });

    const signupData = await signupResponse.json();
    testUserId = signupData.data.user.id;
    
    // Extract session cookie
    const setCookieHeader = signupResponse.headers.get('set-cookie');
    sessionCookie = setCookieHeader || '';
  });

  describe('POST /api/v1/auth/send-verification-email', () => {
    it('sends verification email to authenticated user', async () => {
      const response = await app.request('/api/v1/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Cookie': sessionCookie,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.message).toContain('Verification email sent');

      // Check token was created
      const tokens = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, testUserId));

      expect(tokens).toHaveLength(1);
    });

    it('requires authentication', async () => {
      const response = await app.request('/api/v1/auth/send-verification-email', {
        method: 'POST',
      });

      expect(response.status).toBe(401);
    });

    it('deletes old tokens before creating new one', async () => {
      // Send first email
      await app.request('/api/v1/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Cookie': sessionCookie,
        },
      });

      // Send second email
      await app.request('/api/v1/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Cookie': sessionCookie,
        },
      });

      // Should only have 1 token
      const tokens = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, testUserId));

      expect(tokens).toHaveLength(1);
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('verifies email with valid token', async () => {
      // Generate token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(emailVerificationTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const response = await app.request('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.message).toContain('verified');

      // Check user is verified
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      expect(user.email_verified_at).not.toBeNull();
    });

    it('rejects invalid token', async () => {
      const response = await app.request('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: 'invalid-token' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('Invalid');
    });

    it('rejects expired token', async () => {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(emailVerificationTokens).values({
        userId: testUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // Expired
      });

      const response = await app.request('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('expired');
    });

    it('requires token in request body', async () => {
      const response = await app.request('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('Token is required');
    });
  });
});
