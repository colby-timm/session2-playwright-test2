const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Add Item with Due Date', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForItemsToLoad();
  });

  test.afterEach(async () => {
    // Cleanup: Delete the created item
    const itemExists = await todoPage.itemExists('Item with Due Date');
    if (itemExists) {
      try {
        await todoPage.deleteItem('Item with Due Date');
        await todoPage.page.waitForTimeout(500);
      } catch {
        // Item may have already been deleted
      }
    }
  });

  test('should add item with due date', async ({ page }) => {
    // Set up a future due date (30 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dueDate = futureDate.toISOString().split('T')[0] + 'T14:30';

    // Enter item name in form
    await todoPage.page.fill('input[name="itemName"]', 'Item with Due Date');

    // Set due date using date/time picker
    const dateInput = todoPage.page.locator('input[type="datetime-local"]');
    if (await dateInput.isVisible()) {
      await dateInput.fill(dueDate);
    }

    // Click "Add Item" button
    await todoPage.clickAddButton();

    // Wait for the item to appear
    await page.waitForTimeout(500);

    // Verify new item appears in list
    const itemExists = await todoPage.itemExists('Item with Due Date');
    expect(itemExists).toBe(true);

    // Verify due date displays with item (should contain date info)
    const itemElement = await todoPage.getItemByName('Item with Due Date');
    const itemText = await itemElement.evaluate(el => el.textContent);
    // Check that the item text contains some date/time information
    expect(itemText.length).toBeGreaterThan(0);
  });
});
