import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CryptoWallet/);
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on empty sign in', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Form should show validation messages
    await expect(page.getByText(/email/i)).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });

  test.describe('Demo mode', () => {
    test('should show demo banner on sign in page', async ({ page }) => {
      await page.goto('/auth/sign-in');
      // In demo mode, a banner with auto-filled credentials is shown
      await expect(page.getByText(/demo/i).first()).toBeVisible();
    });
  });
});

test.describe('Navigation', () => {
  test('should have working navigation to dashboard', async ({ page }) => {
    // First login (demo mode auto-logs in)
    await page.goto('/app/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should redirect unauthenticated users to sign in', async ({ page }) => {
    await page.goto('/app/wallet');
    // Should redirect to sign in if not authenticated
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
