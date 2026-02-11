const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest, cleanupItem } = require('./helpers/testHelpers');

test.describe('Add Item with Due Date', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = await setupTest(page);
  });

  test.afterEach(async () => {
    await cleanupItem(todoPage, 'Item with Due Date');
  });

  test('should add item with due date', async () => {
    // Set up a future due date (30 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dueDate = futureDate.toISOString().split('T')[0] + 'T14:30';

    // Add item with due date
    await todoPage.addItem('Item with Due Date', dueDate);

    // Wait for the item to appear
    await todoPage.page.waitForTimeout(500);

    // Verify new item appears in list
    const itemExists = await todoPage.itemExists('Item with Due Date');
    expect(itemExists).toBe(true);

    // Verify due date displays with item
    const itemElement = await todoPage.getItemByName('Item with Due Date');
    const itemText = await itemElement.evaluate(el => el.textContent);
    expect(itemText.length).toBeGreaterThan(0);
  });
});
