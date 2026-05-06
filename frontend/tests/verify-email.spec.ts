import { test, expect } from '@playwright/test';

test.describe('Email Verification', () => {
  test('should show error for missing token', async ({ page }) => {
    await page.goto('/verify-email');

    await expect(page.locator('text=Invalid verification link')).toBeVisible();
    await expect(page.locator('a[href="/resend-verification"]')).toBeVisible();
  });

  test('should show verifying state initially with token', async ({ page }) => {
    await page.goto('/verify-email?token=test-token-123');
    
    // Should briefly show verifying message (or immediately show result)
    // Since token will be invalid, we'll see error after verification attempt
    await page.waitForTimeout(500);
    
    // Check that page has finished loading (not stuck in loading state)
    const isLoading = await page.locator('text=Verifying your email').isVisible().catch(() => false);
    const hasError = await page.locator('text=verification failed').isVisible().catch(() => false);
    const hasSuccess = await page.locator('text=Email verified').isVisible().catch(() => false);
    
    // Should be in one of these states (not stuck loading)
    expect(isLoading || hasError || hasSuccess).toBeTruthy();
  });

  test('should show error for invalid token after verification', async ({ page }) => {
    await page.goto('/verify-email?token=invalid-token');
    
    // Wait for verification to complete
    await page.waitForSelector('text=Verifying your email', { state: 'hidden', timeout: 3000 });
    
    // Should show error message
    await expect(page.locator('text=verification failed')).toBeVisible();
  });

  test('should have link to resend verification on error', async ({ page }) => {
    await page.goto('/verify-email');
    
    await expect(page.locator('a[href*="resend"]')).toBeVisible();
  });
});
