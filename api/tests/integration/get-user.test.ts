import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import app from '@/app';
import { db } from '@/db/connection';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Current User Endpoint Integration Tests
 */

describe('GET /api/v1/auth/user', () => {
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

  test('returns current user with valid session', async () => {
    const { sessionCookie } = await createUserAndLogin(
      'current@example.com',
      'Password123!'
    );

    const res = await app.request('/api/v1/auth/user', {
      method: 'GET',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.user).toBeDefined();
    expect(body.data.user.email).toBe('current@example.com');
    expect(body.data.user.display_name).toBe('Test User');
    expect(body.data.user.role).toBe('user');
    expect(body.data.user.id).toBeTruthy();

    expect(body.meta.version).toBe('v1');
  });

  test('rejects request without session cookie', async () => {
    const res = await app.request('/api/v1/auth/user', {
      method: 'GET',
    });

    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error.code).toBe('NOT_AUTHENTICATED');
    expect(body.error.message).toBe('Not authenticated');
  });

  test('rejects request with invalid session cookie', async () => {
    const res = await app.request('/api/v1/auth/user', {
      method: 'GET',
      headers: {
        Cookie: 'session=invalid-session-id-12345',
      },
    });

    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error.code).toBe('NOT_AUTHENTICATED');
    expect(body.error.message).toBe('Session expired or invalid');
  });

  test('rejects request with expired session', async () => {
    const { sessionCookie } = await createUserAndLogin(
      'expired@example.com',
      'Password123!'
    );

    // Manually invalidate the session using correct Drizzle syntax
    await db.delete(sessions).where(eq(sessions.id, sessionCookie));

    const res = await app.request('/api/v1/auth/user', {
      method: 'GET',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error.code).toBe('NOT_AUTHENTICATED');
  });

  test('does not return password hash', async () => {
    const { sessionCookie } = await createUserAndLogin(
      'secure@example.com',
      'Password123!'
    );

    const res = await app.request('/api/v1/auth/user', {
      method: 'GET',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    const body = await res.json();
    const responseString = JSON.stringify(body);

    expect(responseString).not.toContain('password');
    expect(responseString).not.toContain('$argon2');
    expect(body.data.user.password_hash).toBeUndefined();
  });

  test('works after login', async () => {
    // First signup
    await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'login-then-get@example.com',
        password: 'Password123!',
        display_name: 'Login User',
      }),
    });

    // Then login
    const loginRes = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'login-then-get@example.com',
        password: 'Password123!',
      }),
    });

    const setCookieHeader = loginRes.headers.get('set-cookie');
    const sessionMatch = setCookieHeader?.match(/session=([^;]+)/);
    const sessionCookie = sessionMatch ? sessionMatch[1] : '';

    // Get current user
    const res = await app.request('/api/v1/auth/user', {
      method: 'GET',
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.user.email).toBe('login-then-get@example.com');
    expect(body.data.user.display_name).toBe('Login User');
  });
});
