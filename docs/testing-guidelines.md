# Testing Guidelines

This document outlines the testing principles and practices for the project, covering both unit tests and end-to-end (E2E) tests.

## Unit Tests

### Framework
- **Framework**: Jest
- **Language**: JavaScript

### Naming Conventions
- Test files should follow the pattern: `<filename>.test.js` for files being tested
- Test suites should use descriptive names that clearly indicate what is being tested
- Test cases should use clear, action-oriented descriptions (e.g., "should return the correct user data when given a valid ID")

### Directory Structure

#### Backend Tests
Backend unit tests should be **co-located** with their source files in the `packages/backend/src/__tests__/` directory.

```
packages/backend/src/
├── __tests__/
│   ├── userService.test.js
│   ├── authController.test.js
│   └── utils.test.js
├── userService.js
├── authController.js
└── utils.js
```

#### Frontend Tests
Frontend unit tests should be **co-located** with their source files in the `packages/frontend/src/__tests__/` directory.

```
packages/frontend/src/
├── __tests__/
│   ├── App.test.js
│   ├── components/
│   │   ├── Button.test.js
│   │   └── Form.test.js
│   └── utils/
│       └── helpers.test.js
├── components/
│   ├── Button.js
│   └── Form.js
└── utils/
    └── helpers.js
```

### Best Practices
- Keep tests focused on a single unit of functionality
- Use descriptive test names that follow the pattern: "should [expected behavior] when [condition]"
- Isolate tests by mocking external dependencies (API calls, database queries, etc.)
- Aim for high code coverage, but prioritize testing critical and complex logic
- Use `beforeEach` and `afterEach` hooks for common setup and cleanup operations

## E2E Tests

### Framework
- **Framework**: Playwright
- **Purpose**: Test critical user journeys and key edge cases through the full application stack

### Scope
E2E tests should focus on **5-8 critical user journeys** and **key edge cases** that cover important workflows. These tests are not exhaustive but should represent the most important user interactions and scenarios.

### Test Coverage Examples
- User can add a new to-do item and see it appear in the list
- User can delete a to-do item and see it removed from the list
- User can set a due date when creating an item and see it displayed
- User can see overdue items visually distinguished in the list
- Form validation: attempting to add an empty or whitespace-only item is rejected
- User sees a loading indicator while items are being fetched
- Error handling: appropriate error messages are shown when add/delete operations fail
- Items are displayed in the correct order (newest first)

### Setup and Teardown
- All test setup and teardown should happen **within the test files** themselves
- Use `test.beforeEach()` and `test.afterEach()` for test-specific setup/cleanup
- Create test data during test execution, not in separate fixtures
- Clean up test data and reset application state after each test
- Example patterns:
  ```javascript
  test('user can add a new item and see it in the list', async ({ page }) => {
    // Setup: Navigate to app
    await page.goto('http://localhost:3000');
    
    // Wait for items list to load
    await page.waitForSelector('[data-testid="items-list"]');
    
    // Test: Add a new item
    await page.fill('input[name="itemName"]', 'Buy groceries');
    await page.click('button:has-text("Add Item")');
    
    // Assert: New item appears in the list
    await expect(page.locator('text=Buy groceries')).toBeVisible();
    
    // Teardown: Delete the item to clean up
    await page.click('button[data-testid="delete-Buy groceries"]');
    await expect(page.locator('text=Buy groceries')).not.toBeVisible();
  });
  
  test('user sees error when trying to add empty item', async ({ page }) => {
    // Setup: Navigate to app
    await page.goto('http://localhost:3000');
    
    // Test: Try to add empty item
    await page.click('button:has-text("Add Item")');
    
    // Assert: Item was not added and no new items appear
    const itemCount = await page.locator('[data-testid="item-card"]').count();
    expect(itemCount).toBe(0);
  });
  ```

### Best Practices
- Use page object models or helper functions to reduce duplication across tests
- Write tests from the user's perspective, focusing on what they see and interact with
- Use meaningful selectors (by role, text, or data-testid) rather than fragile CSS selectors
- Run tests in isolation—each test should be able to run independently
- Keep tests at a reasonable length and focus on a single user journey per test
- Use assertions that clearly describe what should happen
- Avoid hard-coded wait times; use Playwright's built-in waiting mechanisms instead

### Configuration
Playwright tests should be configured in `playwright.config.js` with appropriate settings for:
- Base URL pointing to your development or test environment
- Timeout settings for page loads and assertions
- Browser contexts (chrome, firefox, webkit) as needed
- Screenshots/videos for debugging failed tests
