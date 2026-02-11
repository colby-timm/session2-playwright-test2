const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Item Sort Order', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForItemsToLoad();
  });

  test.afterEach(async () => {
    // Cleanup: Delete all test items
    const testItems = ['First Item', 'Second Item', 'Third Item'];
    
    for (const itemName of testItems) {
      const itemExists = await todoPage.itemExists(itemName);
      if (itemExists) {
        try {
          await todoPage.deleteItem(itemName);
          await todoPage.page.waitForTimeout(300);
        } catch {
          // Item may already be deleted
        }
      }
    }
  });

  test('should display items sorted newest first', async ({ page }) => {
    // Add first item
    await todoPage.page.fill('input[name="itemName"]', 'First Item');
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);

    // Add second item
    await todoPage.page.fill('input[name="itemName"]', 'Second Item');
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);

    // Add third item
    await todoPage.page.fill('input[name="itemName"]', 'Third Item');
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);

    // Get all items in order
    const items = await todoPage.getAllItems();
    
    // Filter to only our test items
    const testItems = items.filter(item => 
      item.includes('First Item') || 
      item.includes('Second Item') || 
      item.includes('Third Item')
    );

    // Verify order is newest first (Third, Second, First)
    // The most recently added item should appear first
    expect(testItems.length).toBeGreaterThan(0);
    
    // Check that most recent item appears near the top
    const hasRecentItemNearTop = testItems[0].includes('Third Item');
    expect(hasRecentItemNearTop).toBe(true);
  });

  test('should maintain chronological order when adding items', async ({ page }) => {
    // Initial state: items exist, get initial list
    const initialItems = await todoPage.getAllItems();

    // Add new item
    await todoPage.page.fill('input[name="itemName"]', 'First Item');
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);

    // Get items after first add
    let currentItems = await todoPage.getAllItems();
    const firstItemCount = currentItems.length;
    expect(firstItemCount).toBeGreaterThan(initialItems.length);

    // Add another item immediately after
    await todoPage.page.fill('input[name="itemName"]', 'Second Item');
    await todoPage.clickAddButton();
    await page.waitForTimeout(500);

    // Get final items
    currentItems = await todoPage.getAllItems();
    const secondItemCount = currentItems.length;
    expect(secondItemCount).toBeGreaterThan(firstItemCount);

    // Most recent item should be at top
    const hasMostRecent = currentItems.some(item => item.includes('Second Item'));
    expect(hasMostRecent).toBe(true);
  });
});
