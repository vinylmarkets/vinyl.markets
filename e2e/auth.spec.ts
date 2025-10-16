import { test, expect } from '@playwright/test';

test.describe('Authentication Protection', () => {
  test('should redirect unauthenticated users from /trader route', async ({ page }) => {
    // Navigate to protected trader route
    await page.goto('/trader');
    
    // Should redirect to authentication page
    await expect(page).toHaveURL(/\/trader-auth/);
    
    // Verify auth page elements are present
    await expect(page.locator('text=/sign in|log in|login/i')).toBeVisible();
  });

  test('should allow access to public routes', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Should stay on home page
    await expect(page).toHaveURL('/');
    
    // Page should load successfully
    await expect(page.locator('body')).toBeVisible();
  });
});
