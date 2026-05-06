import { test, expect } from '@playwright/test';

test.describe.serial('Authentication Flow', () => {
  test('should complete full signup flow', async ({ page }) => {
    await page.goto('/signup');
    
    const timestamp = Date.now();
    await page.fill('input[name="display_name"]', 'Test User');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    await expect(page.locator('h2')).toContainText('Welcome, Test User!');
  });

  test('should login with existing account', async ({ browser }) => {
    // Create account in first context
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    const timestamp = Date.now();
    const email = `logintest${timestamp}@example.com`;
    
    await page1.goto('http://localhost:5173/signup');
    await page1.fill('input[name="display_name"]', 'Login Test');
    await page1.fill('input[name="email"]', email);
    await page1.fill('input[name="password"]', 'TestPass123');
    await page1.click('button[type="submit"]');
    await page1.waitForURL('/dashboard');
    
    await context1.close();

    // Login in fresh context
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto('http://localhost:5173/login');
    await page2.fill('input[name="email"]', email);
    await page2.fill('input[name="password"]', 'TestPass123');
    await page2.click('button[type="submit"]');
    await page2.waitForURL('/dashboard');
    
    await expect(page2.locator('h2')).toContainText('Welcome, Login Test!');
    
    await context2.close();
  });

  test('should logout successfully', async ({ page }) => {
    const timestamp = Date.now();
    
    await page.goto('/signup');
    await page.fill('input[name="display_name"]', 'Logout Test');
    await page.fill('input[name="email"]', `logout${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Verify logged out
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
});
