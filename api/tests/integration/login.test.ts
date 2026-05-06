import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import app from '@/app';
import { db } from '@/db/connection';
import { users, sessions } from '@/db/schema';

/**
 * Login Endpoint Integration Tests
 * 
 * TDD Flow:
 * 1. Write these tests first (RED - they will fail)
 * 2. Implement the endpoint (GREEN)
 * 3. Refactor if needed
 */

describe('POST /api/v1/auth/login', () => {
  // Helper to create a test user
  async function createTestUser(email: string, password: string) {
    const signupRes = await app.request('/api/v1/auth/signup', {
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

    return await signupRes.json();
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

  test('successfully logs in with valid credentials', async () => {
    // Create a user first
    await createTestUser('login@example.com', 'ValidPassword123!');

    // Now try to log in
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'login@example.com',
        password: 'ValidPassword123!',
      }),
    });

    expect(res.status).toBe(200);

    const body = await res.json();

    expect(body.data.user).toBeDefined();
    expect(body.data.user.email).toBe('login@example.com');
    expect(body.data.user.display_name).toBe('Test User');

    expect(body.data.session).toBeDefined();
    expect(body.data.session.id).toBeTruthy();

    expect(body.meta.version).toBe('v1');
  });

  test('sets session cookie on login', async () => {
    await createTestUser('cookie@example.com', 'ValidPassword123!');

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'cookie@example.com',
        password: 'ValidPassword123!',
      }),
    });

    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain('session=');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Lax');
  });

  test('normalizes email to lowercase on login', async () => {
    await createTestUser('UPPERCASE@EXAMPLE.COM', 'ValidPassword123!');

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'UPPERCASE@EXAMPLE.COM',
        password: 'ValidPassword123!',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.user.email).toBe('uppercase@example.com');
  });

  test('rejects login with non-existent email', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
    expect(body.error.message).toBe('Invalid email or password');
  });

  test('rejects login with incorrect password', async () => {
    await createTestUser('wrong@example.com', 'CorrectPassword123!');

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'WrongPassword123!',
      }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
    expect(body.error.message).toBe('Invalid email or password');
  });

  test('validates email format', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'ValidPassword123!',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('requires password field', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        // Missing password
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('does not return password hash in response', async () => {
    await createTestUser('secure@example.com', 'SecurePassword123!');

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'secure@example.com',
        password: 'SecurePassword123!',
      }),
    });

    const body = await res.json();
    const responseString = JSON.stringify(body);

    expect(responseString).not.toContain('password');
    expect(responseString).not.toContain('$argon2');
    expect(body.data.user.password_hash).toBeUndefined();
  });

  test('creates a new session on each login', async () => {
    await createTestUser('sessions@example.com', 'Password123!');

    // First login
    const res1 = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sessions@example.com',
        password: 'Password123!',
      }),
    });

    const body1 = await res1.json();
    const sessionId1 = body1.data.session.id;

    // Second login
    const res2 = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sessions@example.com',
        password: 'Password123!',
      }),
    });

    const body2 = await res2.json();
    const sessionId2 = body2.data.session.id;

    // Should create different sessions
    expect(sessionId1).not.toBe(sessionId2);
  });
});
