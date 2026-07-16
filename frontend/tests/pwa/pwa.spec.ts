import { test, expect } from '@playwright/test';

test.describe('PWA capabilities', () => {
  test('should have a manifest link in the HTML', async ({ page }) => {
    await page.goto('/');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest/i);
  });

  test('should register a service worker', async ({ page }) => {
    // Navigate to the app so the SW can register
    await page.goto('/');

    // Give the service worker time to register
    await page.waitForTimeout(2000);

    const hasSw = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });
    expect(hasSw).toBe(true);
  });

  test('should have theme-color meta tag', async ({ page }) => {
    await page.goto('/');
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content');
  });

  test('should have apple-mobile-web-app-capable meta tag', async ({ page }) => {
    await page.goto('/');
    const appleMeta = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleMeta).toHaveAttribute('content', 'yes');
  });

  test('should serve icons for PWA install', async ({ page }) => {
    await page.goto('/');
    // Check that at least one PWA icon is accessible
    const response = await page.request.get('/icons/icon-192.png');
    expect(response.status()).toBe(200);
  });
});
