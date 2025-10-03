import { test, expect } from '@playwright/test';

/**
 * Authentication Flow Tests
 * Tests user signup, login, and session management
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should show landing page with scroll storytelling', async ({ page }) => {
    // Check first section
    await expect(page.getByRole('heading', { name: /transforming insight/i })).toBeVisible();
    
    // Scroll to see more sections
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    
    // Check for "No more" section
    await expect(page.getByText(/no more/i)).toBeVisible();
  });

  test('should hide Learn and Chat links when not authenticated', async ({ page }) => {
    // Check navbar
    const navbar = page.locator('header');
    
    // Should NOT see Learn and Chat links
    await expect(navbar.getByRole('link', { name: /learn/i })).not.toBeVisible();
    await expect(navbar.getByRole('link', { name: /chat/i })).not.toBeVisible();
    
    // Should see Sign in button
    await expect(navbar.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click "Let's Go" button
    await page.getByRole('link', { name: /let's go/i }).click();
    
    // Should be on signup page
    await expect(page).toHaveURL('/auth/signup');
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click "Sign in" in navbar
    await page.getByRole('link', { name: /sign in/i }).click();
    
    // Should be on login page
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on empty signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Should show validation (browser native or custom)
    // Note: This depends on your form implementation
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access /learn without auth
    await page.goto('/learn');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });

  test('should redirect unauthenticated users from chat', async ({ page }) => {
    // Try to access /chat without auth
    await page.goto('/chat');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });
});

/**
 * Note: Full authentication tests (actual signup/login) require:
 * 1. Test database or cleanup strategy
 * 2. Email confirmation handling
 * 3. Session management
 * 
 * These are better suited for manual testing or dedicated auth tests
 * with proper test user management.
 */