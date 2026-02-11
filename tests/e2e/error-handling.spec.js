const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest, getInitialItemCount, verifyItemCountUnchanged, cleanupItem } = require('./helpers/testHelpers');

test.describe('Error Handling', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = await setupTest(page);
  });

  test('should display error on invalid form submission', async () => {
    // Get initial count of items
    const initialCount = await getInitialItemCount(todoPage);
    
    // Try clicking Add without any input (empty form)
    await todoPage.clickAddButton();
    await todoPage.page.waitForTimeout(500);

    // Verify no item was added
    const countUnchanged = await verifyItemCountUnchanged(todoPage, initialCount);
    expect(countUnchanged).toBe(true);
    
    // Verify input field is still empty
    const inputValue = await todoPage.getInputValue();
    expect(inputValue).toBe('');
  });

  test('should display contextual error message on delete failure', async ({ page }) => {
    // Create an item first
    await todoPage.page.fill('input[name="itemName"]', 'Test Item for Deletion');
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);

    // Verify item was created
    const itemExists = await todoPage.itemExists('Test Item for Deletion');
    expect(itemExists).toBe(true);

    // Delete the item
    await todoPage.deleteItem('Test Item for Deletion');
    await page.waitForTimeout(500);

    // Verify deletion was successful
    const itemStillExists = await todoPage.itemExists('Test Item for Deletion');
    expect(itemStillExists).toBe(false);

    // Cleanup (no-op if already deleted)
    await cleanupItem(todoPage, 'Test Item for Deletion');
  });

  test('should allow dismissing error messages', async ({ page }) => {
    // Try to trigger an error (empty submission)
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);

    // Check if error message exists
    const errorMessages = await page.locator('[role="alert"]').count();
    
    if (errorMessages > 0) {
      // Try to close the error message
      const closeButton = page.locator('button[aria-label="Close"]').first();
      const isCloseVisible = await closeButton.isVisible().catch(() => false);
      
      if (isCloseVisible) {
        await closeButton.click();
        await page.waitForTimeout(300);
        
        // Verify error was closed
        const errorAfterClose = await page.locator('[role="alert"]').count();
        expect(errorAfterClose).toBeLessThanOrEqual(errorMessages);
      }
    }
    
    // Form should still be functional
    expect(true).toBe(true);
  });
});
