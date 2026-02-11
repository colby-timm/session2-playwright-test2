const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Add Item', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForItemsToLoad();
  });

  test.afterEach(async () => {
    // Cleanup: Delete the created item
    const itemExists = await todoPage.itemExists('Test Item');
    if (itemExists) {
      try {
        await todoPage.deleteItem('Test Item');
        // Wait a moment for deletion to complete
        await todoPage.page.waitForTimeout(500);
      } catch {
        // Item may have already been deleted
      }
    }
  });

  test('should add new item to the list', async ({ page }) => {
    // Enter item name in form
    await todoPage.page.fill('input[name="itemName"]', 'Test Item');

    // Click "Add Item" button
    await todoPage.clickAddButton();

    // Wait for the item to appear
    await page.waitForTimeout(500);

    // Verify new item appears in list
    const itemExists = await todoPage.itemExists('Test Item');
    expect(itemExists).toBe(true);

    // Verify input field is cleared
    const inputValue = await todoPage.getInputValue();
    expect(inputValue).toBe('');
  });
});
