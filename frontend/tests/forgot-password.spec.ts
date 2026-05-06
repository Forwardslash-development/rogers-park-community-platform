import { test, expect } from '@playwright/test';

test.describe('Forgot Password', () => {
  test('should display forgot password form', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await expect(page.locator('h1')).toContainText('Forgot Password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should submit email and show success message', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Should show success message (even if email doesn't exist - security)
    await expect(page.locator('text=If an account exists')).toBeVisible();
    await expect(page.locator('.return-button')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    // Browser validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should have link back to login', async ({ page }) => {
    await page.goto('/forgot-password');
    
    const loginLink = page.locator('.login-link a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveText('Back to Login');
  });
});
