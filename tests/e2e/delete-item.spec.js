const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Delete Item', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForItemsToLoad();
    
    // Create an item to delete
    await todoPage.page.fill('input[name="itemName"]', 'Item to Delete');
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);
  });

  test.afterEach(async () => {
    // Cleanup: ensure item is deleted
    const itemExists = await todoPage.itemExists('Item to Delete');
    if (itemExists) {
      try {
        await todoPage.deleteItem('Item to Delete');
        await todoPage.page.waitForTimeout(500);
      } catch {
        // Item may have already been deleted
      }
    }
  });

  test('should delete item from list', async ({ page }) => {
    // Verify item exists before deletion
    let itemExists = await todoPage.itemExists('Item to Delete');
    expect(itemExists).toBe(true);

    // Click delete button on the item
    await todoPage.deleteItem('Item to Delete');

    // Wait for deletion to complete
    await page.waitForTimeout(500);

    // Verify item is removed from list
    itemExists = await todoPage.itemExists('Item to Delete');
    expect(itemExists).toBe(false);
  });
});
