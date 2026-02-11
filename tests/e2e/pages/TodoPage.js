/**
 * Page Object Model for the Todo Application
 * Provides methods to interact with the Todo app UI
 */
class TodoPage {
  /**
   * Initialize TodoPage with a Playwright page object
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    // Selectors
    this.itemNameInput = 'input[name="itemName"]';
    this.addItemButton = 'button:has-text("Add Item")';
    this.itemsList = '[data-testid="items-list"]';
    this.loadingIndicator = '[role="progressbar"]';
    this.errorAlert = '[role="alert"]';
    this.closeErrorButton = 'button[aria-label="Close"]';
  }

  /**
   * Navigate to the todo app home page
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Add a new item to the todo list
   * @param {string} itemName - Name of the item to add
   * @param {string} [dueDate] - Optional due date in ISO format
   */
  async addItem(itemName, dueDate = null) {
    // Fill in the item name
    await this.page.fill(this.itemNameInput, itemName);

    // If due date is provided, set it using the date picker
    if (dueDate) {
      // Find the DateTimePicker input (MUI DateTimePicker renders as a TextField input)
      // Look for the input that's inside the form with due date label/placeholder
      const dateInputs = this.page.locator('input[aria-label*="Due"]');
      const count = await dateInputs.count();
      
      if (count > 0) {
        const dateInput = dateInputs.first();
        // Scroll into view to ensure it's visible
        await dateInput.scrollIntoViewIfNeeded();
        // Wait for it to be enabled and visible
        await dateInput.waitFor({ state: 'visible' });
        // Click to open the picker
        await dateInput.click({ timeout: 5000 });
        // Type the date value - format should be YYYY-MM-DD HH:mm
        const dateStr = dueDate.replace('Z', '').replace('T', ' ').split('.')[0];
        await dateInput.fill(dateStr, { timeout: 5000 });
        // Press Tab or Enter to confirm
        await dateInput.press('Tab');
      }
    }

    // Click the Add Item button
    await this.page.click(this.addItemButton);
  }

  /**
   * Delete an item by name
   * @param {string} itemName - Name of the item to delete
   */
  async deleteItem(itemName) {
    // Find the delete button for the specific item
    const testId = `delete-${itemName}`;
    await this.page.click(`button[data-testid="${testId}"]`);
  }

  /**
   * Get a specific item from the list by name
   * @param {string} itemName - Name of the item to find
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  async getItemByName(itemName) {
    return this.page.locator(`text=${itemName}`).first();
  }

  /**
   * Get the loading indicator element
   * @returns {import('@playwright/test').Locator}
   */
  getLoadingIndicator() {
    return this.page.locator(this.loadingIndicator);
  }

  /**
   * Get the error message element
   * @returns {import('@playwright/test').Locator}
   */
  getErrorMessage() {
    return this.page.locator(this.errorAlert);
  }

  /**
   * Get the items list container
   * @returns {import('@playwright/test').Locator}
   */
  getItemsList() {
    return this.page.locator(this.itemsList);
  }

  /**
   * Wait for items to load (wait for list to be visible)
   */
  async waitForItemsToLoad() {
    await this.page.waitForSelector(this.itemsList, { timeout: 10000 });
  }

  /**
   * Wait for the loading indicator to disappear
   */
  async waitForLoadingToComplete() {
    await this.page.waitForSelector(this.loadingIndicator, { state: 'hidden', timeout: 10000 });
  }

  /**
   * Check if an item exists in the list
   * @param {string} itemName - Name of the item to find
   * @returns {Promise<boolean>}
   */
  async itemExists(itemName) {
    try {
      await this.page.waitForSelector(`text=${itemName}`, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all item texts from the list
   * @returns {Promise<string[]>}
   */
  async getAllItems() {
    const items = await this.page.locator('[data-testid^="item-"]').allTextContents();
    return items;
  }

  /**
   * Wait for error message to appear
   */
  async waitForErrorMessage() {
    await this.page.waitForSelector(this.errorAlert, { timeout: 10000 });
  }

  /**
   * Close error message by clicking close button
   */
  async closeErrorMessage() {
    const closeButton = this.page.locator(this.closeErrorButton).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Get the text of the current error message
   * @returns {Promise<string>}
   */
  async getErrorMessageText() {
    const errorElement = this.page.locator(this.errorAlert).first();
    return await errorElement.textContent();
  }

  /**
   * Check if item has overdue styling
   * @param {string} itemName - Name of the item to check
   * @returns {Promise<boolean>}
   */
  async isItemOverdue(itemName) {
    const overdueBadge = this.page.locator(`text=${itemName}`).locator('text=OVERDUE').first();
    try {
      await overdueBadge.waitFor({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the input field value
   * @returns {Promise<string>}
   */
  async getInputValue() {
    return await this.page.inputValue(this.itemNameInput);
  }

  /**
   * Clear the input field
   */
  async clearInput() {
    await this.page.fill(this.itemNameInput, '');
  }

  /**
   * Click the Add Item button
   */
  async clickAddButton() {
    await this.page.click(this.addItemButton);
  }
}

module.exports = { TodoPage };
