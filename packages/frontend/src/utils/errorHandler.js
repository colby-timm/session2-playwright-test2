/**
 * Error handling utilities
 * Centralized error message formatting for consistent user feedback
 */

/**
 * Get a user-friendly error message based on operation type and error
 * @param {string} operation - The operation type ('fetch', 'add', 'delete')
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (operation, error) => {
  const operationLabels = {
    fetch: 'Failed to fetch data',
    add: 'Error adding item',
    delete: 'Error deleting item',
  };

  const baseMessage = operationLabels[operation] || 'An error occurred';
  const errorDetail = error?.message || 'Unknown error';

  return `${baseMessage}: ${errorDetail}`;
};

/**
 * Log error to console for debugging while maintaining user messaging
 * @param {string} context - Context of where the error occurred
 * @param {Error} error - The error object
 */
export const logError = (context, error) => {
  console.error(`${context}:`, error);
};
