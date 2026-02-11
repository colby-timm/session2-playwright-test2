# Functional Requirements

## Overview
This document outlines the core functional requirements for the To Do App, a full-stack JavaScript application with a React frontend and Node.js/Express backend.

## Frontend Requirements

### FR-1: Display Items List
- **Description**: The application shall display a list of all items retrieved from the backend database
- **Acceptance Criteria**:
  - Items are fetched from `/api/items` endpoint on application load
  - Items are displayed in the UI in a readable list format
  - Items are sorted by creation date (newest first)

### FR-2: Add New Item
- **Description**: Users shall be able to add new items to the database through a form input
- **Acceptance Criteria**:
  - A form with a text input field and "Add Item" button is provided
  - User can enter an item name and submit the form
  - On successful submission, the new item is added to the displayed list
  - Input field is cleared after successful submission
  - Form submission is prevented if the input is empty or contains only whitespace

### FR-3: Delete Item
- **Description**: Users shall be able to remove items from the database
- **Acceptance Criteria**:
  - Each item in the list has a delete button
  - Clicking the delete button removes the item from the database
  - The deleted item is immediately removed from the displayed list

### FR-4: Error Handling
- **Description**: The application shall display user-friendly error messages when operations fail
- **Acceptance Criteria**:
  - Error messages are displayed in the UI when fetch operations fail
  - Errors during fetch, add, or delete operations are caught and displayed to the user
  - Error messages provide context about what operation failed

### FR-5: Loading State
- **Description**: The application shall indicate when data is being loaded from the backend
- **Acceptance Criteria**:
  - A loading indicator is displayed while fetching items on initial load
  - Loading state is cleared when data fetch completes or fails

### FR-6: Set Due Date
- **Description**: Users shall be able to set a due date and time for each item
- **Acceptance Criteria**:
  - A date and time picker is provided in the "Add New Item" form
  - Users can set a due date and time when creating a new item
  - Due dates are optional; items can be created without a due date
  - Due date and time are displayed with each item in the list
  - Items can be visually distinguished if overdue (past due date/time)
  - Due dates are sent to the backend and persisted in the database

## Backend Requirements

### FR-7: Retrieve Items
- **Description**: The backend shall provide an endpoint to retrieve all items from the database
- **Acceptance Criteria**:
  - GET `/api/items` endpoint returns a JSON array of all items
  - Each item contains `id`, `name`, `due_date` (optional), and `created_at` fields
  - Items are returned in descending order by creation date
  - Due date is returned in ISO 8601 format (e.g., "2026-02-15T14:30:00Z")
  - Returns HTTP 200 on success
  - Returns HTTP 500 if database query fails

### FR-8: Create Item
- **Description**: The backend shall provide an endpoint to create a new item in the database
- **Acceptance Criteria**:
  - POST `/api/items` endpoint accepts a JSON body with `name` field (required) and `due_date` field (optional)
  - Item name is required and must be a non-empty string
  - Due date must be a valid ISO 8601 date-time string if provided
  - Returns HTTP 201 with the newly created item (including `id`, `due_date`, and `created_at`)
  - Returns HTTP 400 if name is missing, invalid, empty, or due_date format is invalid
  - Returns HTTP 500 if database write operation fails

### FR-9: Delete Item
- **Description**: The backend shall provide an endpoint to delete an item from the database
- **Acceptance Criteria**:
  - DELETE `/api/items/:id` endpoint deletes an item by ID
  - Returns HTTP 200 with a success message when item is deleted
  - Returns HTTP 400 if item ID is invalid or missing
  - Returns HTTP 404 if item does not exist
  - Returns HTTP 500 if database delete operation fails

### FR-10: Data Persistence
- **Description**: The application shall persist item data across server requests
- **Acceptance Criteria**:
  - Items created during a session are accessible in subsequent requests
  - Due date information is persisted with each item
  - Database is initialized with sample data on startup
  - Database tables are created automatically if they don't exist
