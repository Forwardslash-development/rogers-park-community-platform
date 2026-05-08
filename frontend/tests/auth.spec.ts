import { test, expect, type Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:3000/api/v1/test/reset');
  });

  function makeUser(label: string) {
    const id = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      email: `${id}@example.com`,
      password: 'TestPass123',
      display_name: `Test ${label}`,
    };
  }

  async function signup(page: Page, user: ReturnType<typeof makeUser>) {
    await page.goto('/signup');
    await expect(page.locator('form')).toBeVisible();
    await page.fill('input[name="display_name"]', user.display_name);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10_000 }),
      page.click('button[type="submit"]'),
    ]);
  }

  test('should complete full signup flow', async ({ page }) => {
    await signup(page, makeUser('signup'));
    await expect(page.locator('h2')).toContainText('Welcome');
  });

  test('should login with existing account', async ({ page }) => {
    const user = makeUser('login');
    await signup(page, user);

    await page.context().clearCookies();
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10_000 }),
      page.click('button[type="submit"]'),
    ]);
    await expect(page.locator('h2')).toContainText('Welcome');
  });

  test('should logout successfully', async ({ page }) => {
    await signup(page, makeUser('logout'));

    await Promise.all([
      page.waitForURL('/'),
      page.click('[data-testid="logout"]'),
    ]);

    await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
    await expect(page.locator('nav a[href="/login"]')).toBeVisible();
  });

  test('should reject invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/login');
  });

  test('should protect dashboard when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/login');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[name="display_name"]', 'Test');
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'TestPass123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should have forgot password link on login page', async ({ page }) => {
    await page.goto('/login');
    const forgotPasswordLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveText('Forgot Password?');
    await forgotPasswordLink.click();
    await page.waitForURL('/forgot-password');
    await expect(page.locator('h1')).toContainText('Forgot Password');
  });
});
