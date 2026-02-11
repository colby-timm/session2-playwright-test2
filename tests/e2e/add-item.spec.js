const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest, cleanupItem, createItemAndVerify } = require('./helpers/testHelpers');

test.describe('Add Item', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = await setupTest(page);
  });

  test.afterEach(async () => {
    await cleanupItem(todoPage, 'Test Item');
  });

  test('should add new item to the list', async () => {
    // Enter item name and add it
    const wasCreated = await createItemAndVerify(todoPage, 'Test Item');
    expect(wasCreated).toBe(true);

    // Verify input field is cleared
    const inputValue = await todoPage.getInputValue();
    expect(inputValue).toBe('');
  });
});
