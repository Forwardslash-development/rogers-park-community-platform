import { test, expect } from '@playwright/test';

test.describe('Resend Verification', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/resend-verification');
    // Should redirect to login
    await page.waitForURL(/login/, { timeout: 3000 });
    expect(page.url()).toContain('/login');
  });

  test.describe('when authenticated', () => {
    test.beforeEach(async ({ page }) => {
      // Create a new user account
      const timestamp = Date.now();
      const email = `verify${timestamp}@example.com`;
      
      await page.goto('/signup');
      await page.fill('input[name="display_name"]', 'Test User');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'TestPass123');
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL(/dashboard/, { timeout: 5000 });
    });

    test('should display resend verification button', async ({ page }) => {
      await page.goto('/resend-verification');
      await expect(page.locator('h1')).toContainText('Resend Verification');
      await expect(page.locator('.submit-button')).toBeVisible();
    });

    test('should show success message after sending', async ({ page }) => {
      await page.goto('/resend-verification');
      await page.click('.submit-button');
      // Should show success message
      await expect(page.locator('.success')).toBeVisible({ timeout: 3000 });
    });

    test('should hide button after successful submission', async ({ page }) => {
      await page.goto('/resend-verification');
      const button = page.locator('.submit-button');
      await button.click();
      // Wait for submission
      await page.waitForTimeout(1500);
      // After success, button should not be visible (success state shows instead)
      const buttonVisible = await button.isVisible().catch(() => false);
      expect(buttonVisible).toBeFalsy();
    });
  });
});
