import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '@/app';
import { db } from '@/db/connection';
import { users, sessions } from '@/db/schema';

/**
 * Signup Endpoint Integration Tests
 * 
 * TDD Flow:
 * 1. Write these tests first (RED - they will fail)
 * 2. Implement the endpoint (GREEN)
 * 3. Refactor if needed
 */

describe('POST /api/v1/auth/signup', () => {
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

  test('successfully creates a new user', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        display_name: 'Test User',
      }),
    });

    expect(res.status).toBe(201);
    
    const body = await res.json();
    
    expect(body.data.user).toBeDefined();
    expect(body.data.user.email).toBe('test@example.com');
    expect(body.data.user.display_name).toBe('Test User');
    expect(body.data.user.role).toBe('user');
    expect(body.data.user.id).toBeTruthy();
    
    expect(body.data.session).toBeDefined();
    expect(body.data.session.id).toBeTruthy();
    expect(body.data.session.user_id).toBe(body.data.user.id);
    
    expect(body.meta.version).toBe('v1');
    expect(body.meta.timestamp).toBeTruthy();
  });

  test('sets session cookie on signup', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'cookie@example.com',
        password: 'SecurePassword123!',
        display_name: 'Cookie User',
      }),
    });

    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain('session=');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Lax');
    expect(setCookieHeader).toContain('Max-Age=2592000'); // 30 days
  });

  test('normalizes email to lowercase', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePassword123!',
        display_name: 'Test User',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.user.email).toBe('test@example.com');
  });

  test('rejects duplicate email', async () => {
    // Create first user
    await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'duplicate@example.com',
        password: 'Password123!',
        display_name: 'First User',
      }),
    });

    // Try to create second user with same email
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'duplicate@example.com',
        password: 'DifferentPassword123!',
        display_name: 'Second User',
      }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe('EMAIL_TAKEN');
    expect(body.error.message).toBe('Email address is already registered');
  });

  test('validates email format', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'SecurePassword123!',
        display_name: 'Test User',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('validates password length (min 8 chars)', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
        display_name: 'Test User',
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('validates display_name length', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        display_name: 'A', // Too short (min 2)
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('requires all fields', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        // Missing password and display_name
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('does not return password hash in response', async () => {
    const res = await app.request('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'secure@example.com',
        password: 'SecurePassword123!',
        display_name: 'Secure User',
      }),
    });

    const body = await res.json();
    const responseString = JSON.stringify(body);
    
    expect(responseString).not.toContain('password');
    expect(responseString).not.toContain('$argon2');
    expect(body.data.user.password_hash).toBeUndefined();
  });
});
