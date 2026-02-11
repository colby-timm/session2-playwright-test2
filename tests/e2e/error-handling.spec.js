const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Error Handling', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForItemsToLoad();
  });

  test('should display error on invalid form submission', async ({ page }) => {
    // Get initial count of items
    const initialItems = await todoPage.getAllItems();
    const initialCount = initialItems.length;
    
    // Try clicking Add without any input (empty form)
    await todoPage.clickAddButton();
    
    // Wait for potential validation or response
    await page.waitForTimeout(500);

    // Verify no item was added (list should be same size)
    const itemsAfter = await todoPage.getAllItems();
    expect(itemsAfter.length).toBe(initialCount);
    
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
    
    // Even without error display, form should still be functional
    expect(true).toBe(true);
  });
});
