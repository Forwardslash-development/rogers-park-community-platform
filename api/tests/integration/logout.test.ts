import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import app from '@/app';
import { db } from '@/db/connection';
import { users, sessions } from '@/db/schema';

/**
 * Logout Endpoint Integration Tests
 * 
 * TDD Flow:
 * 1. Write these tests first (RED - they will fail)
 * 2. Implement the endpoint (GREEN)
 * 3. Refactor if needed
 */

describe('POST /api/v1/auth/logout', () => {
  // Helper to create a test user and get session cookie
  async function createUserAndLogin(email: string, password: string) {
    const loginRes = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        display_name: 'Test User',
      }),
    });

    const setCookieHeader = loginRes.headers.get('set-cookie');
    
    // Extract session cookie value
    const sessionMatch = setCookieHeader?.match(/session=([^;]+)/);
    const sessionCookie = sessionMatch ? sessionMatch[1] : '';

    return { sessionCookie, response: await loginRes.json() };
  }

  beforeEach(async () => {
    // Clean database before each test
    await db.delete(sessions);
    await db.delete(users);
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(sessions);
    await db.delete(users);
  });

  test('successfully logs out with valid session', async () => {
    const { sessionCookie } = await createUserAndLogin(
      'logout@example.com',
      'Password123!'
    );

    const res = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.message).toBe('Logged out successfully');
    expect(body.meta.version).toBe('v1');
  });

  test('deletes session cookie on logout', async () => {
    const { sessionCookie } = await createUserAndLogin(
      'cookie@example.com',
      'Password123!'
    );

    const res = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toBeTruthy();
    
    // Should delete the cookie (Max-Age=0 or expires in the past)
    expect(setCookieHeader).toMatch(/session=.*?(Max-Age=0|expires=)/i);
  });

  test('invalidates session in database', async () => {
    const { sessionCookie } = await createUserAndLogin(
      'invalidate@example.com',
      'Password123!'
    );

    // Logout
    await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    // Try to use the same session again (will test in next endpoint)
    // For now, just verify session is gone from database
    const [session] = await db
      .select()
      .from(sessions)
      .where((t) => t.id === sessionCookie);

    expect(session).toBeUndefined();
  });

  test('rejects logout without session cookie', async () => {
    const res = await app.request('/api/v1/auth/logout', {
      method: 'POST',
    });

    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error.code).toBe('NOT_AUTHENTICATED');
    expect(body.error.message).toBe('Not authenticated');
  });

  test('rejects logout with invalid session cookie', async () => {
    const res = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: 'session=invalid-session-id-that-does-not-exist',
      },
    });

    // Should still return 200 (idempotent logout)
    // Even if session doesn't exist, logout succeeds
    expect(res.status).toBe(200);
  });

  test('allows multiple logouts (idempotent)', async () => {
    const { sessionCookie } = await createUserAndLogin(
      'multiple@example.com',
      'Password123!'
    );

    // First logout
    const res1 = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(res1.status).toBe(200);

    // Second logout with same cookie (should still work)
    const res2 = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(res2.status).toBe(200);
  });
});
