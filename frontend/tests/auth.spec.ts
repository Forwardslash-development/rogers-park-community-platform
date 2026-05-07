import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  // Use a fresh browser context for each test to avoid cookie pollution
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should complete full signup flow', async ({ page }) => {
    await page.goto('/signup');

    const timestamp = Date.now();

    await page.fill('input[name="display_name"]', 'Test User');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123');
    
    // Submit form and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    await expect(page.locator('h2')).toContainText('Welcome');
  });

  test('should login with existing account', async ({ browser }) => {
    const context1 = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page1 = await context1.newPage();

    const timestamp = Date.now();
    const email = `logintest${timestamp}@example.com`;

    await page1.goto('/signup');
    await page1.fill('input[name="display_name"]', 'Login Test');
    await page1.fill('input[name="email"]', email);
    await page1.fill('input[name="password"]', 'TestPass123');
    
    await Promise.all([
      page1.waitForURL('/dashboard', { timeout: 10000 }),
      page1.click('button[type="submit"]')
    ]);
    await context1.close();

    const context2 = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page2 = await context2.newPage();

    await page2.goto('/login');
    await page2.fill('input[name="email"]', email);
    await page2.fill('input[name="password"]', 'TestPass123');
    
    await Promise.all([
      page2.waitForURL('/dashboard', { timeout: 10000 }),
      page2.click('button[type="submit"]')
    ]);
    
    await expect(page2.locator('h2')).toContainText('Welcome');
    await context2.close();
  });

  test('should logout successfully', async ({ page }) => {
    const timestamp = Date.now();

    await page.goto('/signup');
    await page.fill('input[name="display_name"]', 'Logout Test');
    await page.fill('input[name="email"]', `logout${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123');
    
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);

    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
    await expect(page.locator('nav a[href="/login"]')).toBeVisible();
  });

  test('should reject invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

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

    await page.waitForTimeout(500);
    expect(page.url()).toContain('/signup');
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
