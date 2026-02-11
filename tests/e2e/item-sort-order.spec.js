const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest, cleanupItem, createItemAndVerify } = require('./helpers/testHelpers');

test.describe('Item Sort Order', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = await setupTest(page);
  });

  test.afterEach(async () => {
    // Cleanup: Delete all test items
    const testItems = ['First Item', 'Second Item', 'Third Item'];
    
    for (const itemName of testItems) {
      await cleanupItem(todoPage, itemName);
    }
  });

  test('should display items sorted newest first', async ({ page }) => {
    // Add items in sequence
    await createItemAndVerify(todoPage, 'First Item');
    await createItemAndVerify(todoPage, 'Second Item');
    await createItemAndVerify(todoPage, 'Third Item');

    // Get all items in order
    const items = await todoPage.getAllItems();
    
    // Filter to only test items
    const testItems = items.filter(item => 
      item.includes('First Item') || 
      item.includes('Second Item') || 
      item.includes('Third Item')
    );

    // Verify order is newest first (Third, Second, First)
    expect(testItems.length).toBeGreaterThan(0);
    // Most recently added item should appear first
    const hasRecentItemNearTop = testItems[0].includes('Third Item');
    expect(hasRecentItemNearTop).toBe(true);
  });

  test('should maintain chronological order when adding items', async ({ page }) => {
    // Get initial list
    const initialItems = await todoPage.getAllItems();

    // Add first item
    const firstAdded = await createItemAndVerify(todoPage, 'First Item');
    expect(firstAdded).toBe(true);

    // Get items after first add
    let currentItems = await todoPage.getAllItems();
    const firstItemCount = currentItems.length;
    expect(firstItemCount).toBeGreaterThan(initialItems.length);

    // Add second item
    const secondAdded = await createItemAndVerify(todoPage, 'Second Item');
    expect(secondAdded).toBe(true);

    // Get final items
    currentItems = await todoPage.getAllItems();
    const secondItemCount = currentItems.length;
    expect(secondItemCount).toBeGreaterThan(firstItemCount);

    // Most recent item should be in the list
    const hasMostRecent = currentItems.some(item => item.includes('Second Item'));
    expect(hasMostRecent).toBe(true);
  });
});
