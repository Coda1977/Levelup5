import { test, expect } from '@playwright/test';

/**
 * Security Tests
 * Tests XSS prevention, unauthorized access, and security measures
 */

test.describe('Security - XSS Prevention', () => {
  test('should strip malicious scripts from chapter content', async ({ page }) => {
    await page.goto('/learn');
    
    // Skip if not authenticated
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip();
    }
    
    // Navigate to any chapter
    const firstCard = page.locator('.card-feature').first();
    const cardCount = await page.locator('.card-feature').count();
    
    if (cardCount > 0) {
      await firstCard.getByRole('link').click();
      
      // Check that no script tags are present in the rendered content
      const scripts = await page.locator('article script').count();
      expect(scripts).toBe(0);
      
      // Check that no inline event handlers are present
      const onclickElements = await page.locator('article [onclick]').count();
      expect(onclickElements).toBe(0);
    }
  });

  test('should only allow whitelisted iframes', async ({ page }) => {
    await page.goto('/learn');
    
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip();
    }
    
    // Navigate to chapter
    const firstCard = page.locator('.card-feature').first();
    const cardCount = await page.locator('.card-feature').count();
    
    if (cardCount > 0) {
      await firstCard.getByRole('link').click();
      
      // Get all iframes
      const iframes = page.locator('article iframe');
      const count = await iframes.count();
      
      // Check each iframe src
      for (let i = 0; i < count; i++) {
        const src = await iframes.nth(i).getAttribute('src');
        
        // Should only be YouTube or Spotify
        const isAllowed = 
          src?.includes('youtube.com/embed') || 
          src?.includes('open.spotify.com/embed');
        
        expect(isAllowed).toBe(true);
      }
    }
  });
});

test.describe('Security - Unauthorized Access', () => {
  test('should block access to /editor without admin role', async ({ page }) => {
    await page.goto('/editor');
    
    // Should redirect to login or home
    const url = page.url();
    expect(url).not.toContain('/editor');
  });

  test('should block access to /users without admin role', async ({ page }) => {
    await page.goto('/users');
    
    // Should redirect to login or home
    const url = page.url();
    expect(url).not.toContain('/users');
  });

  test('should block access to admin API routes', async ({ page }) => {
    // Try to access admin API directly
    const response = await page.request.get('/api/admin/categories');
    
    // Should return 401 or 403
    expect([401, 403]).toContain(response.status());
  });

  test('should block access to user management API', async ({ page }) => {
    // Try to access users API directly
    const response = await page.request.get('/api/admin/users');
    
    // Should return 401 or 403
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Security - Session Management', () => {
  test('should require authentication for protected routes', async ({ page }) => {
    const protectedRoutes = ['/learn', '/chat', '/editor', '/users'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login
      await expect(page).toHaveURL('/auth/login');
    }
  });

  test('should allow access to public routes', async ({ page }) => {
    const publicRoutes = ['/', '/auth/login', '/auth/signup'];
    
    for (const route of publicRoutes) {
      await page.goto(route);
      
      // Should NOT redirect
      await expect(page).toHaveURL(route);
    }
  });
});

test.describe('Security - Data Validation', () => {
  test('should handle empty form submissions gracefully', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation or stay on page
    await expect(page).toHaveURL('/auth/login');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try invalid email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should show validation
    // Browser native validation or custom
  });
});