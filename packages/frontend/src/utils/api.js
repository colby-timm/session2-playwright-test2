/**
 * API utility module for making requests to the backend
 * Central place for all API interactions to follow DRY principle
 */

/**
 * Fetch all items from the backend
 * @returns {Promise<Array>} Array of items
 * @throws {Error} If the API request fails
 */
export const fetchItems = async () => {
  const response = await fetch('/api/items');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

/**
 * Add a new item to the backend
 * @param {string} name - The item name
 * @param {string|null} due_date - Optional ISO 8601 formatted due date
 * @returns {Promise<Object>} The created item with id from backend
 * @throws {Error} If the API request fails
 */
export const createItem = async (name, due_date = null) => {
  const payload = { name };
  if (due_date) {
    payload.due_date = due_date;
  }

  const response = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add item');
  }

  return response.json();
};

/**
 * Delete an item from the backend
 * @param {number} itemId - The ID of the item to delete
 * @returns {Promise<Object>} Response from the backend
 * @throws {Error} If the API request fails
 */
export const deleteItem = async (itemId) => {
  const response = await fetch(`/api/items/${itemId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete item');
  }

  return response.json();
};
