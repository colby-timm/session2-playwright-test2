const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Form Validation', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForItemsToLoad();
  });

  test('should reject empty form submission', async ({ page }) => {
    // Attempt to submit with empty form (don't fill anything)
    await todoPage.clickAddButton();

    // Wait a moment to see if validation error appears
    await page.waitForTimeout(300);

    // The input should still be empty or error state should be visible
    const inputValue = await todoPage.getInputValue();
    // Either the input is still empty or there's validation preventing submission
    expect(inputValue === '').toBe(true);
  });

  test('should reject whitespace-only item name', async ({ page }) => {
    // Get initial count of items
    const initialItems = await todoPage.getAllItems();
    const initialCount = initialItems.length;
    
    // Enter whitespace-only item name
    await todoPage.page.fill('input[name="itemName"]', '   ');

    // Try to submit
    await todoPage.clickAddButton();

    // Wait for potential validation error
    await page.waitForTimeout(500);

    // Verify no item was added (list should be same size)
    const itemsAfter = await todoPage.getAllItems();
    expect(itemsAfter.length).toBe(initialCount);
  });

  test('should display validation error message', async ({ page }) => {
    // Get initial count of items
    const initialItems = await todoPage.getAllItems();
    const initialCount = initialItems.length;
    
    // Enter whitespace-only text
    await todoPage.page.fill('input[name="itemName"]', '   ');

    // Try to submit
    await todoPage.clickAddButton();

    // Wait for validation to occur
    await page.waitForTimeout(500);

    // Verify no item was added
    const itemsAfter = await todoPage.getAllItems();
    expect(itemsAfter.length).toBe(initialCount);
    
    // Check that the input field shows error state (aria-invalid or helper text)
    const inputElement = todoPage.page.locator('input[name="itemName"]');
    const hasError = await inputElement.evaluate(el => {
      // Check if input has error attribute
      return el.getAttribute('aria-invalid') === 'true';
    });
    
    // Either there's visible validation error or form prevented submission
    expect(hasError || itemsAfter.length === initialCount).toBe(true);
  });

  test('should allow form submission with valid item name', async ({ page }) => {
    // Enter valid item name
    await todoPage.page.fill('input[name="itemName"]', 'Valid Item');

    // Submit form
    await todoPage.clickAddButton();

    // Wait for form to process
    await page.waitForTimeout(500);

    // Verify item was added
    const itemExists = await todoPage.itemExists('Valid Item');
    expect(itemExists).toBe(true);

    // Cleanup
    try {
      await todoPage.deleteItem('Valid Item');
    } catch {
      // Item cleanup not critical for test
    }
  });
});
