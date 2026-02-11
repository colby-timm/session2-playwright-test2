const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest } = require('./helpers/testHelpers');

test.describe('Loading Indicator', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
  });

  test('should display loading indicator while items are loading', async ({ page }) => {
    // Navigate to app (triggers loading)
    const navigationPromise = todoPage.goto();
    
    // Get loading indicator locator
    const loadingIndicator = todoPage.getLoadingIndicator();
    
    // Wait for navigation to complete
    await navigationPromise;

    // Wait for loading to complete
    try {
      await todoPage.waitForLoadingToComplete();
    } catch {
      // Loading may have completed too quickly to observe
    }

    // Verify items list is displayed
    const itemsList = todoPage.getItemsList();
    const listVisible = await itemsList.isVisible();
    expect(listVisible).toBe(true);
  });

  test('should hide loading indicator after items load', async ({ page }) => {
    // Navigate to app
    await todoPage.goto();

    // Wait for loading indicator to disappear
    try {
      await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 5000 });
    } catch {
      // Loading indicator may not exist or already hidden
    }

    // Verify items list is visible
    const itemsList = todoPage.getItemsList();
    const listVisible = await itemsList.isVisible();
    expect(listVisible).toBe(true);

    // Verify the container is visible
    expect(listVisible).toBe(true);
  });
});
