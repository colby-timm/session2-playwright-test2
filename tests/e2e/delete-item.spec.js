const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest, cleanupItem, createItemAndVerify, deleteItemAndVerify } = require('./helpers/testHelpers');

test.describe('Delete Item', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = await setupTest(page);
    // Create an item to delete
    await createItemAndVerify(todoPage, 'Item to Delete');
  });

  test.afterEach(async () => {
    await cleanupItem(todoPage, 'Item to Delete');
  });

  test('should delete item from list', async () => {
    // Delete the item and verify it's gone
    const wasDeleted = await deleteItemAndVerify(todoPage, 'Item to Delete');
    expect(wasDeleted).toBe(true);
  });
});
