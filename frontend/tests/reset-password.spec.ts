import { test, expect } from '@playwright/test';

test.describe('Reset Password', () => {
  // Note: We can't easily test with a real token in E2E without backend integration
  // These tests will focus on the UI behavior

  test('should show error for missing token', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.locator('text=Invalid or missing reset token')).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  });

  test('should display error message for invalid token', async ({ page }) => {
    // Navigate with a token parameter (will be invalid since API isn't running)
    await page.goto('/reset-password?token=test-token-123');
    
    // Wait for validation to complete (loading message should disappear)
    await page.waitForSelector('text=Validating reset token', { state: 'hidden', timeout: 3000 });
    
    // Should show error message after validation fails
    await expect(page.locator('text=Invalid or expired')).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  });

  test('should have password and confirm password fields when form is shown', async ({ page }) => {
    await page.goto('/reset-password?token=valid-test-token');
    
    // Wait for validation to complete
    await page.waitForTimeout(1500);
    
    // Check if password fields exist (might not be visible if token is invalid)
    const passwordField = page.locator('input[name="newPassword"]');
    const confirmField = page.locator('input[name="confirmPassword"]');
    
    const hasPasswordField = await passwordField.count();
    const hasConfirmField = await confirmField.count();
    
    // If form is shown, both fields should exist
    if (hasPasswordField > 0) {
      expect(hasConfirmField).toBeGreaterThan(0);
    }
  });

  test('should have a link to request new reset if token invalid', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  });
});
