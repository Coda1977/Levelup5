# E2E Tests - Playwright

End-to-end tests for LevelUp5 using Playwright.

## 📋 Test Suites

### 1. **Authentication Tests** ([`auth.spec.ts`](auth.spec.ts))
- Landing page scroll storytelling
- Navigation visibility (authenticated vs unauthenticated)
- Signup/login page navigation
- Protected route redirects

### 2. **Learn Flow Tests** ([`learn.spec.ts`](learn.spec.ts))
- Personalized greeting
- Progress bar display
- Continue Learning section
- Chapter cards and navigation
- Mark Complete functionality
- Audio player (if available)
- Prev/Next navigation

### 3. **Chat Flow Tests** ([`chat.spec.ts`](chat.spec.ts))
- Chat interface display
- Stars icon (not robot)
- Input field and send button
- Conversations sidebar (right side)
- Overlay behavior
- Empty state
- Button states

### 4. **Admin Tests** ([`admin.spec.ts`](admin.spec.ts))
- Access control for /editor and /users
- Content management interface
- User management interface
- TTS generation (skipped - long-running)

### 5. **Security Tests** ([`security.spec.ts`](security.spec.ts))
- XSS prevention in chapter content
- Iframe whitelist enforcement
- Unauthorized access blocking
- Admin API protection
- Session management
- Form validation

## 🚀 Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/auth.spec.ts
```

### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View test report
```bash
npm run test:e2e:report
```

## 📊 Test Coverage

### **Total Tests:** ~30 tests across 5 suites

**By Category:**
- Authentication: 7 tests
- Learn Flow: 10 tests
- Chat Flow: 11 tests
- Admin: 8 tests
- Security: 12 tests

**By Browser:**
- Chromium (Desktop)
- Firefox (Desktop)
- Webkit/Safari (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## ⚙️ Configuration

Configuration is in [`playwright.config.ts`](../playwright.config.ts)

**Key Settings:**
- Base URL: `http://localhost:3000`
- Parallel execution: Yes
- Retries on CI: 2
- Screenshots: On failure
- Videos: On failure
- Trace: On first retry

## 🔧 Prerequisites

### 1. Install Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Run Tests
```bash
npm run test:e2e
```

## 📝 Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.getByRole('button', { name: /click me/i });
    
    // Act
    await element.click();
    
    // Assert
    await expect(page).toHaveURL('/expected-url');
  });
});
```

### Best Practices
1. **Use semantic selectors** - `getByRole`, `getByText`, `getByLabel`
2. **Wait for elements** - Use `expect().toBeVisible()` instead of `waitForTimeout`
3. **Handle auth states** - Skip tests that require auth if not logged in
4. **Clean up** - Use `beforeEach` and `afterEach` for setup/teardown
5. **Descriptive names** - Test names should explain what they verify

## 🐛 Debugging

### Debug specific test
```bash
npx playwright test e2e/auth.spec.ts --debug
```

### Run with headed browser
```bash
npx playwright test --headed
```

### Slow down execution
```bash
npx playwright test --slow-mo=1000
```

### Generate test code
```bash
npx playwright codegen http://localhost:3000
```

## 📊 CI/CD Integration

Tests are configured to run in CI with:
- Retries: 2
- Workers: 1 (sequential)
- Screenshots and videos on failure
- HTML report generation

## ⚠️ Known Limitations

### Authentication Tests
- Full signup/login tests require test database
- Email confirmation needs handling
- Better suited for manual testing initially

### Chat Tests
- AI response tests are skipped (long-running)
- Require valid API keys
- Better for integration testing

### Admin Tests
- TTS generation skipped (expensive operation)
- Content creation tests need cleanup strategy

## 🎯 Success Criteria

Tests should:
- ✅ Run in < 5 minutes
- ✅ Pass on all browsers
- ✅ Cover critical user flows
- ✅ Catch regressions
- ✅ Be maintainable

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)