# Testing Strategy
## Rogers Park Community Platform — Auth MVP (v1.0)

**Last Updated:** May 2026  
**Status:** Active  
**Approach:** Test-Driven Development (TDD)

---

## Overview

This document defines the testing strategy for the Auth MVP. We follow TDD: write tests first, implement code to pass tests, refactor. Tests are organized in three layers: unit, integration, and end-to-end.

**Philosophy:** Tests should earn their complexity. Write tests that prevent real bugs; avoid tests that merely check syntax.

---

## Test Pyramid

```
         ▲
        ╱ ╲ 
       ╱   ╲  E2E (Playwright)
      ╱─────╲ - Full user journey
     ╱       ╲ - 3-5 tests
    ╱─────────╲
   ╱           ╲ Integration (Vitest + Supertest)
  ╱             ╲ - API + Database + Auth
 ╱───────────────╲ - 20-30 tests
╱                 ╲
─────────────────── Unit (Vitest)
                   - Password hashing, token generation
                   - Validation, error handling
                   - 40-50 tests
```

**Coverage targets:**
- **Auth logic (unit):** 90%+ (password hashing, token generation, validation)
- **API endpoints (integration):** 80%+ (happy path + error cases)
- **E2E flows:** Critical paths only (signup, login, logout, unauthorized access)

---

## Unit Tests (Vitest)

### Purpose
Test isolated functions: password hashing, token generation, validation rules, error handling. No database, no HTTP calls.

### Test Location
```
/tests/unit/
  auth.test.ts
  validation.test.ts
  errors.test.ts
```

### Execution
```bash
pnpm test:unit          # Run once
pnpm test:unit --watch # Watch mode (development)
```

---

## Unit Test Specs

### 1. Password Hashing (auth.test.ts)

```typescript
describe('Password Hashing', () => {
  test('hashes a password correctly', async () => {
    const password = 'SecurePassword123!';
    const hash = await hashPassword(password);
    
    expect(hash).toBeTruthy();
    expect(hash).not.toBe(password); // Should not be plaintext
    expect(hash.length).toBeGreaterThan(50); // Argon2 hashes are long
  });
  
  test('same password produces different hashes (due to salt)', async () => {
    const password = 'SecurePassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    
    expect(hash1).not.toBe(hash2); // Different due to salt
  });
  
  test('verifies a correct password', async () => {
    const password = 'SecurePassword123!';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });
  
  test('rejects an incorrect password', async () => {
    const hash = await hashPassword('CorrectPassword123!');
    
    const isValid = await verifyPassword('WrongPassword456!', hash);
    expect(isValid).toBe(false);
  });
  
  test('rejects empty password', async () => {
    const hash = await hashPassword('ValidPassword123!');
    
    const isValid = await verifyPassword('', hash);
    expect(isValid).toBe(false);
  });
});
```

### 2. Email Validation (validation.test.ts)

```typescript
describe('Email Validation', () => {
  test('accepts valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'john.doe@example.co.uk',
      'user+tag@example.com',
      'user123@sub.example.com'
    ];
    
    validEmails.forEach(email => {
      expect(validateEmail(email)).toBe(true);
    });
  });
  
  test('rejects invalid email addresses', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
      'user@.com',
      ''
    ];
    
    invalidEmails.forEach(email => {
      expect(validateEmail(email)).toBe(false);
    });
  });
  
  test('normalizes email to lowercase', () => {
    const email = 'User@Example.COM';
    expect(normalizeEmail(email)).toBe('user@example.com');
  });
  
  test('rejects very long emails', () => {
    const longEmail = 'a'.repeat(256) + '@example.com';
    expect(validateEmail(longEmail)).toBe(false);
  });
});
```

### 3. Password Validation (validation.test.ts)

```typescript
describe('Password Validation', () => {
  test('accepts valid passwords', () => {
    const validPasswords = [
      'ValidPass123!',
      'AnotherPassword456!',
      'SimplePassword123'
    ];
    
    validPasswords.forEach(password => {
      expect(validatePassword(password)).toBe(true);
    });
  });
  
  test('rejects passwords that are too short', () => {
    expect(validatePassword('Short1!')).toBe(false); // 7 chars
  });
  
  test('rejects passwords that are too long', () => {
    const longPassword = 'a'.repeat(129);
    expect(validatePassword(longPassword)).toBe(false);
  });
  
  test('rejects empty password', () => {
    expect(validatePassword('')).toBe(false);
  });
});
```

### 4. Display Name Validation (validation.test.ts)

```typescript
describe('Display Name Validation', () => {
  test('accepts valid display names', () => {
    const validNames = [
      'Jane Doe',
      'John',
      'Mary Ann Smith',
      'José García'
    ];
    
    validNames.forEach(name => {
      expect(validateDisplayName(name)).toBe(true);
    });
  });
  
  test('rejects names that are too short', () => {
    expect(validateDisplayName('J')).toBe(false);
  });
  
  test('rejects names that are too long', () => {
    const longName = 'a'.repeat(101);
    expect(validateDisplayName(longName)).toBe(false);
  });
  
  test('rejects names with special characters', () => {
    expect(validateDisplayName('Jane@Doe!')).toBe(false);
    expect(validateDisplayName('User#123')).toBe(false);
  });
  
  test('allows names with spaces and hyphens', () => {
    expect(validateDisplayName('Mary-Jane Smith')).toBe(true);
  });
});
```

### 5. Error Handling (errors.test.ts)

```typescript
describe('Error Handling', () => {
  test('creates proper error with code and message', () => {
    const error = createAuthError('EMAIL_TAKEN', 'Email already registered');
    
    expect(error.code).toBe('EMAIL_TAKEN');
    expect(error.message).toBe('Email already registered');
  });
  
  test('formats error for API response', () => {
    const error = createAuthError('INVALID_EMAIL', 'Invalid email format');
    const response = formatErrorResponse(error);
    
    expect(response).toHaveProperty('error.code');
    expect(response).toHaveProperty('error.message');
    expect(response).toHaveProperty('meta.timestamp');
  });
});
```

---

## Integration Tests (Vitest + Supertest)

### Purpose
Test API endpoints with a real database (test database), but no UI. Uses Supertest to make HTTP calls to Hono server.

### Test Location
```
/tests/integration/
  auth-signup.test.ts
  auth-login.test.ts
  auth-logout.test.ts
  auth-user.test.ts
  health.test.ts
```

### Setup

Each test file uses a test database and transaction rollback:

```typescript
// tests/integration/setup.ts
import { pool } from '@/db/pool';

export async function setupTestDb() {
  // Ensure test database exists
  // Clear tables before each test
}

export async function teardownTestDb() {
  // Disconnect, cleanup
}

export async function withTransaction(fn: (db) => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await fn(client);
    await client.query('ROLLBACK'); // Undo changes after test
  } finally {
    client.release();
  }
}
```

### Execution
```bash
pnpm test:integration          # Run once
pnpm test:integration --watch # Watch mode
```

---

## Integration Test Specs

### 1. Signup Endpoint Tests (auth-signup.test.ts)

```typescript
import request from 'supertest';
import { app } from '@/api/app';
import { withTransaction } from './setup';

describe('POST /api/v1/auth/signup', () => {
  test('creates a new user with valid input', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'ValidPassword123!',
          display_name: 'New User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data.user.id');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
      expect(response.body.data).toHaveProperty('session');
    });
  });
  
  test('sets auth_session cookie on signup', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'ValidPassword123!',
          display_name: 'New User'
        });
      
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('auth_session=');
      expect(cookieHeader).toContain('HttpOnly');
      expect(cookieHeader).toContain('Secure');
      expect(cookieHeader).toContain('SameSite=Lax');
    });
  });
  
  test('rejects duplicate email', async () => {
    await withTransaction(async (db) => {
      // Create first user
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'ValidPassword123!',
          display_name: 'First User'
        });
      
      // Try to create second user with same email
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'AnotherPassword456!',
          display_name: 'Second User'
        });
      
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('EMAIL_TAKEN');
    });
  });
  
  test('rejects invalid email format', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'notanemail',
          password: 'ValidPassword123!',
          display_name: 'User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_EMAIL');
    });
  });
  
  test('rejects password that is too short', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'Short1', // 6 chars
          display_name: 'User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_PASSWORD');
    });
  });
  
  test('rejects missing required fields', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com'
          // Missing password and display_name
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
  
  test('normalizes email to lowercase', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'User@Example.COM',
          password: 'ValidPassword123!',
          display_name: 'User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe('user@example.com');
    });
  });
  
  test('enforces rate limiting (10 attempts/hour per IP)', async () => {
    await withTransaction(async (db) => {
      // Make 10 signup attempts
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/v1/auth/signup')
          .send({
            email: `user${i}@example.com`,
            password: 'ValidPassword123!',
            display_name: `User ${i}`
          });
      }
      
      // 11th attempt should be rate-limited
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user11@example.com',
          password: 'ValidPassword123!',
          display_name: 'User 11'
        });
      
      expect(response.status).toBe(429);
      expect(response.body.error.code).toBe('RATE_LIMITED');
    });
  });
});
```

### 2. Login Endpoint Tests (auth-login.test.ts)

```typescript
describe('POST /api/v1/auth/login', () => {
  test('logs in user with valid credentials', async () => {
    await withTransaction(async (db) => {
      // Create user
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!',
          display_name: 'User'
        });
      
      // Log in
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('user@example.com');
      expect(response.body.data).toHaveProperty('session');
    });
  });
  
  test('rejects wrong password', async () => {
    await withTransaction(async (db) => {
      // Create user
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'CorrectPassword123!',
          display_name: 'User'
        });
      
      // Try to log in with wrong password
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword456!'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });
  
  test('rejects nonexistent email (generic error)', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      // Note: same error as wrong password, prevents user enumeration
    });
  });
  
  test('sets auth_session cookie on login', async () => {
    await withTransaction(async (db) => {
      // Create user
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!',
          display_name: 'User'
        });
      
      // Log in
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!'
        });
      
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('auth_session=');
      expect(cookieHeader).toContain('HttpOnly');
    });
  });
  
  test('enforces rate limiting (5 attempts/hour per IP)', async () => {
    await withTransaction(async (db) => {
      // Make 5 login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'SomePassword123!'
          });
      }
      
      // 6th attempt should be rate-limited
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        });
      
      expect(response.status).toBe(429);
    });
  });
});
```

### 3. Logout Endpoint Tests (auth-logout.test.ts)

```typescript
describe('POST /api/v1/auth/logout', () => {
  test('logs out authenticated user', async () => {
    await withTransaction(async (db) => {
      // Create and log in user
      const signupResponse = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!',
          display_name: 'User'
        });
      
      const sessionCookie = signupResponse.headers['set-cookie'][0];
      
      // Log out
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', sessionCookie);
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.data.message).toContain('success');
    });
  });
  
  test('rejects logout without session', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .post('/api/v1/auth/logout');
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('NOT_AUTHENTICATED');
    });
  });
  
  test('clears auth_session cookie', async () => {
    await withTransaction(async (db) => {
      // Create and log in user
      const signupResponse = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!',
          display_name: 'User'
        });
      
      const sessionCookie = signupResponse.headers['set-cookie'][0];
      
      // Log out
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', sessionCookie);
      
      const clearCookie = logoutResponse.headers['set-cookie'][0];
      expect(clearCookie).toContain('Max-Age=0');
    });
  });
});
```

### 4. Get Current User Tests (auth-user.test.ts)

```typescript
describe('GET /api/v1/auth/user', () => {
  test('returns authenticated user', async () => {
    await withTransaction(async (db) => {
      const signupResponse = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'ValidPassword123!',
          display_name: 'User'
        });
      
      const sessionCookie = signupResponse.headers['set-cookie'][0];
      
      const response = await request(app)
        .get('/api/v1/auth/user')
        .set('Cookie', sessionCookie);
      
      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('user@example.com');
    });
  });
  
  test('rejects request without session', async () => {
    await withTransaction(async (db) => {
      const response = await request(app)
        .get('/api/v1/auth/user');
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('NOT_AUTHENTICATED');
    });
  });
});
```

### 5. Health Check Tests (health.test.ts)

```typescript
describe('GET /api/v1/health', () => {
  test('returns healthy status', async () => {
    const response = await request(app)
      .get('/api/v1/health');
    
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('healthy');
  });
  
  test('returns current timestamp', async () => {
    const response = await request(app)
      .get('/api/v1/health');
    
    expect(response.body.data.timestamp).toBeDefined();
    expect(new Date(response.body.data.timestamp)).toBeInstanceOf(Date);
  });
});
```

---

## End-to-End Tests (Playwright)

### Purpose
Test full user journeys in the browser: form submission, navigation, page state. Captures the complete signup → login → logout flow.

### Test Location
```
/tests/e2e/
  auth.spec.ts
```

### Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Execution
```bash
pnpm test:e2e          # Run once
pnpm test:e2e --ui    # Interactive mode with browser
pnpm test:e2e --debug # Debug mode
```

---

## E2E Test Specs (auth.spec.ts)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Auth Flows', () => {
  test('user can sign up and see dashboard', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');
    
    // Fill out form
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.fill('input[name="displayName"]', 'New User');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Dashboard should show user name
    await expect(page.locator('text=New User')).toBeVisible();
  });
  
  test('user can log out and return to home', async ({ page }) => {
    // Sign up first
    await page.goto('/signup');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.fill('input[name="displayName"]', 'User');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Click logout button
    await page.click('button:has-text("Log Out")');
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
    
    // Home page should not show dashboard content
    await expect(page.locator('text=New User')).not.toBeVisible();
  });
  
  test('user can log in with existing account', async ({ page }) => {
    // Sign up first (in beforeEach ideally, but simplified here)
    await page.goto('/signup');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'ExistingPassword123!');
    await page.fill('input[name="displayName"]', 'Existing User');
    await page.click('button[type="submit"]');
    
    // Log out
    await page.click('button:has-text("Log Out")');
    
    // Navigate to login
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'ExistingPassword123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Existing User')).toBeVisible();
  });
  
  test('user sees error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with wrong password
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should see error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });
  
  test('user cannot access dashboard without authentication', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

---

## Test Data & Fixtures

### Test User

A fixed test user is created at the start of integration tests:

```typescript
// tests/integration/fixtures.ts
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  displayName: 'Test User'
};

export async function createTestUser(db) {
  return await db.users.create({
    email: TEST_USER.email,
    password_hash: await hashPassword(TEST_USER.password),
    display_name: TEST_USER.displayName,
    role: 'user'
  });
}
```

---

## Test Execution

### Run All Tests
```bash
pnpm test              # Unit + Integration + E2E
```

### Run by Layer
```bash
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests only
pnpm test:e2e          # E2E tests only
```

### Watch Mode (Development)
```bash
pnpm test --watch
pnpm test:unit --watch
pnpm test:integration --watch
```

### Coverage Report
```bash
pnpm test:coverage
```

Coverage should be:
- **Auth logic:** 90%+
- **API routes:** 80%+
- **Database queries:** 85%+

---

## TDD Workflow

### Step-by-Step Process

1. **Write failing test** (RED)
   ```bash
   # Test describes the desired behavior
   test('user can sign up', async () => { ... });
   
   # Run test — it fails because feature doesn't exist yet
   pnpm test:unit --watch
   ```

2. **Implement to pass test** (GREEN)
   ```typescript
   // Implement just enough to make test pass
   export async function signupUser(email, password) {
     return { id: 'user_1', email };
   }
   
   # Test passes
   ```

3. **Refactor** (REFACTOR)
   ```typescript
   // Improve implementation while keeping test passing
   // Better error handling, validation, etc.
   ```

4. **Repeat** for next feature

### Example: Signup Function

**Step 1: Write failing test**
```typescript
test('hashes password with Argon2', async () => {
  const user = await createUser('user@example.com', 'Password123!');
  expect(user.password_hash).toBeDefined();
  expect(user.password_hash).not.toBe('Password123!');
});
```

**Step 2: Implement minimum**
```typescript
export async function createUser(email, password) {
  const hash = await hashPassword(password);
  return { email, password_hash: hash };
}
```

**Step 3: Refactor & add validation**
```typescript
export async function createUser(email, password) {
  if (!validateEmail(email)) throw new Error('Invalid email');
  if (!validatePassword(password)) throw new Error('Invalid password');
  const hash = await hashPassword(password);
  return db.users.insert({ email, password_hash: hash });
}
```

---

## Test Review Checklist

Before merging auth code:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage: auth logic ≥90%, endpoints ≥80%
- [ ] No `test.skip()` or `test.only()` in committed code
- [ ] Tests are named descriptively ("should reject invalid email", not "test1")
- [ ] No hardcoded credentials in test files (use fixtures)
- [ ] No console.log() in tests (use proper assertions)
- [ ] Tests run in under 30 seconds

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: rogerspan_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:e2e
      - run: pnpm test:coverage

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: coverage
          path: coverage/
```

---

**Document Version:** 1.0  
**Last Reviewed:** May 2026
