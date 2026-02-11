/**
 * Shared E2E test helpers
 * Reduces duplication across E2E test files
 */

const { test } = require('@playwright/test');
const { TodoPage } = require('../pages/TodoPage');

/**
 * Standard test setup helper
 * Initializes TodoPage and navigates to the app
 * @param {Function} page - The Playwright page fixture
 * @returns {Promise<TodoPage>}
 */
async function setupTest(page) {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  await todoPage.waitForItemsToLoad();
  return todoPage;
}

/**
 * Standard test cleanup helper
 * Deletes a created item if it exists
 * Used in afterEach hooks to clean up test data
 * @param {TodoPage} todoPage - The TodoPage instance
 * @param {string} itemName - Name of the item to delete
 */
async function cleanupItem(todoPage, itemName) {
  const itemExists = await todoPage.itemExists(itemName);
  if (itemExists) {
    try {
      await todoPage.deleteItem(itemName);
      // Slight delay to allow deletion to complete
      await todoPage.page.waitForTimeout(300);
    } catch {
      // Item may have already been deleted or deletion failed
    }
  }
}

/**
 * Standard afterEach cleanup pattern for tests that create items
 * @param {Error} testError - Error from test if it failed
 * @returns {object} Config object for test.afterEach
 */
function createCleanupHook(itemName) {
  return async function cleanup() {
    // This is designed to be called within test.afterEach
    // The todoPage instance will be available from the test scope
  };
}

/**
 * Get initial item count
 * Useful for verifying no new items were added
 * @param {TodoPage} todoPage - The TodoPage instance
 * @returns {Promise<number>}
 */
async function getInitialItemCount(todoPage) {
  const items = await todoPage.getAllItems();
  return items.length;
}

/**
 * Assert that item count hasn't changed
 * @param {TodoPage} todoPage - The TodoPage instance
 * @param {number} initialCount - The initial count to compare against
 * @returns {Promise<boolean>}
 */
async function verifyItemCountUnchanged(todoPage, initialCount) {
  const items = await todoPage.getAllItems();
  return items.length === initialCount;
}

/**
 * Create an item and wait for it to appear
 * @param {TodoPage} todoPage - The TodoPage instance
 * @param {string} itemName - The name of the item to create
 * @param {string} [dueDate] - Optional due date
 * @returns {Promise<boolean>}
 */
async function createItemAndVerify(todoPage, itemName, dueDate = null) {
  await todoPage.addItem(itemName, dueDate);
  // Wait for item to appear
  await todoPage.page.waitForTimeout(300);
  return await todoPage.itemExists(itemName);
}

/**
 * Delete an item and verify it's gone
 * @param {TodoPage} todoPage - The TodoPage instance
 * @param {string} itemName - The name of the item to delete
 * @returns {Promise<boolean>}
 */
async function deleteItemAndVerify(todoPage, itemName) {
  await todoPage.deleteItem(itemName);
  // Wait for deletion to complete
  await todoPage.page.waitForTimeout(300);
  return !(await todoPage.itemExists(itemName));
}

module.exports = {
  setupTest,
  cleanupItem,
  createCleanupHook,
  getInitialItemCount,
  verifyItemCountUnchanged,
  createItemAndVerify,
  deleteItemAndVerify,
};
