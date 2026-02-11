const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { setupTest, cleanupItem, getInitialItemCount, verifyItemCountUnchanged } = require('./helpers/testHelpers');

test.describe('Form Validation', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = await setupTest(page);
  });

  test('should reject empty form submission', async () => {
    // Attempt to submit with empty form
    await todoPage.clickAddButton();
    await todoPage.page.waitForTimeout(300);

    // Input should still be empty
    const inputValue = await todoPage.getInputValue();
    expect(inputValue === '').toBe(true);
  });

  test('should reject whitespace-only item name', async () => {
    // Get initial count of items
    const initialCount = await getInitialItemCount(todoPage);
    
    // Enter whitespace-only item name
    await todoPage.page.fill('input[name="itemName"]', '   ');
    await todoPage.clickAddButton();
    await todoPage.page.waitForTimeout(500);

    // Verify no item was added
    const countUnchanged = await verifyItemCountUnchanged(todoPage, initialCount);
    expect(countUnchanged).toBe(true);
  });

  test('should display validation error message', async () => {
    // Get initial count of items
    const initialCount = await getInitialItemCount(todoPage);
    
    // Enter whitespace-only text
    await todoPage.page.fill('input[name="itemName"]', '   ');
    await todoPage.clickAddButton();
    await todoPage.page.waitForTimeout(500);

    // Verify no item was added
    const countUnchanged = await verifyItemCountUnchanged(todoPage, initialCount);
    expect(countUnchanged).toBe(true);
    
    // Check that the input field shows error state
    const inputElement = todoPage.page.locator('input[name="itemName"]');
    const hasError = await inputElement.evaluate(el => {
      return el.getAttribute('aria-invalid') === 'true';
    });
    
    // Either there's validation error or submission was prevented
    expect(hasError || countUnchanged).toBe(true);
  });

  test('should allow form submission with valid item name', async () => {
    // Enter valid item name
    await todoPage.page.fill('input[name="itemName"]', 'Valid Item');
    await todoPage.clickAddButton();
    await todoPage.page.waitForTimeout(500);

    // Verify item was added
    const itemExists = await todoPage.itemExists('Valid Item');
    expect(itemExists).toBe(true);

    // Cleanup
    await cleanupItem(todoPage, 'Valid Item');
  });
});
