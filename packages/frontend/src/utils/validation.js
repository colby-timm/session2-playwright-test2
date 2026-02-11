/**
 * Form validation utilities
 * Reusable validation functions following DRY principle
 */

/**
 * Validate item name - cannot be empty or whitespace-only
 * @param {string} itemName - The item name to validate
 * @returns {Object} Object with isValid boolean and error message if invalid
 */
export const validateItemName = (itemName) => {
  if (!itemName.trim()) {
    return {
      isValid: false,
      error: 'Item name cannot be empty',
    };
  }

  return {
    isValid: true,
    error: '',
  };
};
