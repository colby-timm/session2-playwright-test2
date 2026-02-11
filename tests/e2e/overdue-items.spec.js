const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Overdue Item Display', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForItemsToLoad();
  });

  test.afterEach(async () => {
    // Cleanup: Delete test items
    const overdueItemExists = await todoPage.itemExists('Overdue Item');
    const futureItemExists = await todoPage.itemExists('Future Item');
    
    if (overdueItemExists) {
      try {
        await todoPage.deleteItem('Overdue Item');
        await todoPage.page.waitForTimeout(500);
      } catch {
        // Item cleanup not critical
      }
    }
    
    if (futureItemExists) {
      try {
        await todoPage.deleteItem('Future Item');
        await todoPage.page.waitForTimeout(500);
      } catch {
        // Item cleanup not critical
      }
    }
  });

  test('should visually distinguish overdue items', async ({ page }) => {
    // Create an item with a past due date (yesterday)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const overdueDateStr = pastDate.toISOString().split('T')[0] + 'T10:00';

    // Add item with past due date
    await todoPage.page.fill('input[name="itemName"]', 'Overdue Item');
    const dateInput = todoPage.page.locator('input[type="datetime-local"]');
    if (await dateInput.isVisible()) {
      await dateInput.fill(overdueDateStr);
    }
    await todoPage.clickAddButton();

    // Wait for item to appear
    await page.waitForTimeout(500);

    // Verify overdue item is visually distinguished
    const isOverdue = await todoPage.isItemOverdue('Overdue Item');
    expect(isOverdue).toBe(true);

    // Check for OVERDUE badge or text
    const overdueBadge = page.locator(`text=${/OVERDUE/i}`);
    const badgeVisible = await overdueBadge.isVisible().catch(() => false);
    expect(badgeVisible).toBe(true);
  });

  test('should not apply overdue styling to future items', async ({ page }) => {
    // Create an item with a future due date (30 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0] + 'T10:00';

    // Add item with future due date
    await todoPage.page.fill('input[name="itemName"]', 'Future Item');
    const dateInput = todoPage.page.locator('input[type="datetime-local"]');
    if (await dateInput.isVisible()) {
      await dateInput.fill(futureDateStr);
    }
    await todoPage.clickAddButton();

    // Wait for item to appear
    await page.waitForTimeout(500);

    // Verify future item does NOT have overdue styling
    const isOverdue = await todoPage.isItemOverdue('Future Item');
    expect(isOverdue).toBe(false);

    // Verify item exists
    const itemExists = await todoPage.itemExists('Future Item');
    expect(itemExists).toBe(true);
  });
});
