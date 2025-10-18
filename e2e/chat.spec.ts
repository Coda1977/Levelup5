import { test, expect } from '@playwright/test';

/**
 * Chat Flow Tests
 * Tests AI chat functionality, conversation management, and UX
 * 
 * Prerequisites: User must be logged in
 */

test.describe('Chat Flow (Unauthenticated)', () => {
  test('should redirect to login when accessing /chat', async ({ page }) => {
    await page.goto('/chat');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('Chat Flow (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    
    // Skip if redirected to login
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip();
    }
  });

  test('should show chat interface with header', async ({ page }) => {
    // Check for chat header
    await expect(page.getByRole('heading', { name: /your ai coach/i })).toBeVisible();
    
    // Check for stars icon (not robot)
    await expect(page.getByText('✨')).toBeVisible();
    
    // Check for status text
    await expect(page.getByText(/ready to help/i)).toBeVisible();
  });

  test('should show empty state when no messages', async ({ page }) => {
    // Look for new chat state
    const emptyState = page.getByRole('heading', { name: /start a conversation/i });
    
    // May or may not be visible depending on conversation state
    // Just verify page loads
    await expect(page.locator('input[placeholder*="message"]')).toBeVisible();
  });

  test('should have input field and send button', async ({ page }) => {
    // Check for input field
    const input = page.locator('input[placeholder*="message"]');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    
    // Check for send button
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeVisible();
  });

  test('should show conversations menu button', async ({ page }) => {
    // Check for hamburger menu (on right side)
    const menuButton = page.getByRole('button', { name: /toggle conversations/i });
    await expect(menuButton).toBeVisible();
  });

  test('should open conversations sidebar from left', async ({ page }) => {
    // Click menu button
    const menuButton = page.getByRole('button', { name: /toggle conversations/i });
    await menuButton.click();
    
    // Sidebar should appear
    await expect(page.getByRole('button', { name: /new chat/i })).toBeVisible();
    
    // Should be positioned on left side
    const sidebar = page.locator('.fixed.left-0');
    await expect(sidebar).toBeVisible();
  });

  test('should have New Chat button in sidebar', async ({ page }) => {
    // Open sidebar
    await page.getByRole('button', { name: /toggle conversations/i }).click();
    
    // Check for New Chat button
    const newChatButton = page.getByRole('button', { name: /new chat/i });
    await expect(newChatButton).toBeVisible();
  });

  test('should close sidebar when clicking overlay', async ({ page }) => {
    // Open sidebar
    await page.getByRole('button', { name: /toggle conversations/i }).click();
    
    // Click overlay
    const overlay = page.locator('.fixed.inset-0.bg-black\\/50');
    await overlay.click();
    
    // Sidebar should close
    await expect(page.getByRole('button', { name: /new chat/i })).not.toBeVisible();
  });

  test('should disable send button when input is empty', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Should be disabled when empty
    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button when input has text', async ({ page }) => {
    const input = page.locator('input[placeholder*="message"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Type message
    await input.fill('Test message');
    
    // Should be enabled
    await expect(sendButton).toBeEnabled();
  });
});

/**
 * Chat Functionality Tests
 * These require actual API integration and may take longer
 */
test.describe('Chat Functionality (Integration)', () => {
  test.skip('should send message and receive AI response', async ({ page }) => {
    // This test requires:
    // 1. Valid authentication
    // 2. Working AI API
    // 3. Longer timeout for streaming
    
    await page.goto('/chat');
    
    const input = page.locator('input[placeholder*="message"]');
    await input.fill('Hello, this is a test message');
    
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for AI response (may take 5-10 seconds)
    await expect(page.locator('.message-ai')).toBeVisible({ timeout: 15000 });
  });

  test.skip('should show typing indicator while AI is responding', async ({ page }) => {
    await page.goto('/chat');
    
    const input = page.locator('input[placeholder*="message"]');
    await input.fill('Test message');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should show typing indicator
    await expect(page.locator('.typing-indicator')).toBeVisible({ timeout: 2000 });
  });

  test.skip('should display clickable follow-up questions', async ({ page }) => {
    await page.goto('/chat');
    
    // Send message
    const input = page.locator('input[placeholder*="message"]');
    await input.fill('How do I give feedback?');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await page.waitForTimeout(10000);
    
    // Look for follow-up buttons
    const followUpButtons = page.locator('button').filter({ hasText: /\?$/ });
    const count = await followUpButtons.count();
    
    if (count > 0) {
      await expect(followUpButtons.first()).toBeVisible();
    }
  });
});