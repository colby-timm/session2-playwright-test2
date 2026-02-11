const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest, cleanupItem } = require('./helpers/testHelpers');

test.describe('Overdue Item Display', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = await setupTest(page);
  });

  test.afterEach(async () => {
    // Cleanup: Delete test items
    await cleanupItem(todoPage, 'Overdue Item');
    await cleanupItem(todoPage, 'Future Item');
  });

  test('should visually distinguish overdue items', async ({ page }) => {
    // Create an item with a past due date (yesterday)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const overdueDateStr = pastDate.toISOString().split('T')[0] + 'T10:00';

    // Add item with past due date
    await todoPage.addItem('Overdue Item', overdueDateStr);
    await page.waitForTimeout(500);

    // Verify overdue item is visually distinguished
    const isOverdue = await todoPage.isItemOverdue('Overdue Item');
    expect(isOverdue).toBe(true);

    // Check for OVERDUE badge
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
    await todoPage.addItem('Future Item', futureDateStr);
    await page.waitForTimeout(500);

    // Verify future item does NOT have overdue styling
    const isOverdue = await todoPage.isItemOverdue('Future Item');
    expect(isOverdue).toBe(false);

    // Verify item exists
    const itemExists = await todoPage.itemExists('Future Item');
    expect(itemExists).toBe(true);
  });
});
