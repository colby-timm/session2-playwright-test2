# Implementation Checklist: To Do App

## Current State Analysis
- **Backend API**: Core endpoints exist (GET, POST, DELETE) but missing `due_date` support
- **Frontend**: Basic React app exists with item management, but no Material UI
- **Tests**: Basic unit tests exist, but missing integration tests and E2E tests
- **E2E**: No Playwright setup or tests

---

## PHASE 1: BACKEND API DEVELOPMENT

### Database & Schema
- [x] Update database table schema to include `due_date` column (nullable, ISO 8601 format)
- [x] Update sample data initialization with example due dates
- [x] Ensure database creates `due_date` column as optional field

### API Endpoints
- [x] **GET /api/items** - Verify endpoint returns `due_date` field in response
- [x] **POST /api/items** - Add support for optional `due_date` in request body
  - [x] Validate `due_date` format (ISO 8601) if provided
  - [x] Return HTTP 400 if `due_date` format is invalid
  - [x] Store `due_date` in database
  - [x] Return `due_date` in response
- [x] **DELETE /api/items/:id** - Verify endpoint works correctly

### Backend Unit Tests
- [x] Test GET /api/items returns items with `due_date` field
- [x] Test POST /api/items accepts valid `due_date` format
- [x] Test POST /api/items rejects invalid `due_date` format (HTTP 400)
- [x] Test POST /api/items works without `due_date` (optional field)
- [x] Test POST /api/items rejects empty item name
- [x] Test POST /api/items rejects whitespace-only item name
- [x] Test DELETE /api/items/:id with valid ID
- [x] Test DELETE /api/items/:id with invalid ID (HTTP 400)
- [x] Test DELETE /api/items/:id with non-existent ID (HTTP 404)
- [x] Test error handling returns proper status codes (500)

---

## PHASE 2: FRONTEND UI DEVELOPMENT

### Material UI Setup
- [x] Install Material UI dependencies (`@mui/material`, `@emotion/react`, `@emotion/styled`)
- [x] Install Material UI icons package (`@mui/icons-material`)
- [x] Install date picker library (`@mui/x-date-pickers`)
- [x] Setup Material UI theme configuration (centralized)
- [x] Create theme with primary, secondary, and accent colors
- [x] Apply theme to App component

### UI Components - Display Items (FR-1)
- [x] Replace `<ul>` with Material UI `List` component
- [x] Replace `<li>` with Material UI `ListItem` component
- [x] Add `data-testid="items-list"` to list container
- [x] Verify items display in newest-first order
- [x] Ensure responsive design works on mobile

### UI Components - Add Item Form (FR-2)
- [x] Replace plain `<input>` with Material UI `TextField`
  - [x] Set `name="itemName"` attribute
  - [x] Add placeholder text
  - [x] Add helper text for validation
- [x] Replace plain `<button>` with Material UI `Button` component
- [x] Add Material UI date/time picker for due date (optional)
  - [x] Use DateTimePicker from `@mui/x-date-pickers`
  - [x] Make due date optional (allow empty)
  - [x] Format selected date to ISO 8601 before sending to backend
- [x] Form validation:
  - [x] Reject empty item names
  - [x] Reject whitespace-only item names
  - [x] Show validation errors using Material UI `TextField` error prop
- [x] Clear input field after successful submission
- [x] Wrap form in Material UI `Paper` component for styling

### UI Components - Delete Functionality (FR-3)
- [x] Replace delete button with Material UI `IconButton`
- [x] Use `DeleteIcon` from Material UI icons
- [x] Add `data-testid="delete-<itemName>"` to delete button for testing
- [x] Style delete button appropriately (e.g., error color)
- [ ] Add delete confirmation dialog (optional but recommended)

### UI Components - Error Handling (FR-4)
- [x] Replace error `<p>` with Material UI `Alert` component
- [x] Display error severity (error type)
- [x] Show contextual error messages for fetch/add/delete failures
- [x] Add close button to dismiss error messages
- [ ] Use Material UI `Snackbar` for transient error notifications (optional)

### UI Components - Loading State (FR-5)
- [x] Replace loading text with Material UI `CircularProgress` component
- [x] Wrap loading indicator in a centered container
- [x] Add descriptive text alongside loader
- [x] Clear loading indicator when fetch completes
- [ ] Use Material UI `Skeleton` for loading state (optional)

### UI Components - Due Date Display (FR-6)
- [x] Display `due_date` next to each item name
- [x] Format date/time in user-friendly format (e.g., "Feb 15, 2026 2:30 PM")
- [x] Add visual distinction for overdue items:
  - [x] Apply error color to overdue item text or background
  - [x] Add "OVERDUE" badge using Material UI `Chip` component
  - [x] Use warning color for items due soon (within 24 hours)
- [x] Handle items without due dates gracefully

### Layout & Styling
- [x] Use Material UI `Container` for main content area
- [x] Use Material UI `Box` component for sections
- [x] Use Material UI `Stack` component for form layout
- [x] Apply consistent spacing using Material UI spacing system (8px multiples)
- [x] Use Material UI `AppBar` for header
- [x] Implement responsive grid layout for different screen sizes
- [x] Ensure WCAG AA color contrast ratios

### Frontend Unit Tests
- [x] Test App component renders correctly
- [x] Test items list displays fetched items
- [x] Test items sorted by creation date (newest first)
- [x] Test form input field updates state
- [x] Test add item form submission
- [x] Test form clears input after successful submission
- [x] Test form rejects empty item name
- [x] Test form rejects whitespace-only item name
- [x] Test delete button removes item from list
- [x] Test error messages display on fetch failure
- [x] Test error messages display on add failure
- [x] Test error messages display on delete failure
- [x] Test loading indicator displays during fetch
- [x] Test loading indicator clears when fetch completes
- [x] Test due date displays with each item
- [x] Test overdue items are visually distinguished
- [x] Co-locate all frontend tests in `packages/frontend/src/__tests__/`

---

## PHASE 3: END-TO-END TESTING WITH PLAYWRIGHT

### Playwright Setup
- [ ] Create `playwright.config.js` in root directory
- [ ] Configure Playwright for single browser (Chromium)
- [ ] Set `baseURL` to `http://localhost:3000`
- [ ] Set timeout and retry settings appropriately
- [ ] Create `tests/e2e/` directory for E2E tests

### Page Object Model (POM) Structure
- [ ] Create `tests/e2e/pages/` directory
- [ ] Create `TodoPage.js` with page object methods:
  - [ ] `goto()` - Navigate to app
  - [ ] `addItem(itemName, dueDate)` - Add new item
  - [ ] `deleteItem(itemName)` - Delete specific item
  - [ ] `getItemByName(itemName)` - Find item in list
  - [ ] `getLoadingIndicator()` - Get loading element
  - [ ] `getErrorMessage()` - Get error message element
  - [ ] `getItemsList()` - Get items list container
  - [ ] `waitForItemsToLoad()` - Wait for list to appear
  - [ ] Other helper methods as needed

### E2E Test: Add New Item (1/8)
- [ ] File: `tests/e2e/add-item.spec.js`
- [ ] Navigate to app and wait for items list
- [ ] Enter item name in form
- [ ] Click "Add Item" button
- [ ] Verify new item appears in list
- [ ] Verify input field is cleared
- [ ] Cleanup: Delete the created item

### E2E Test: Delete Item (2/8)
- [ ] File: `tests/e2e/delete-item.spec.js`
- [ ] Navigate to app and wait for items list
- [ ] Click delete button on an item
- [ ] Verify item is removed from list
- [ ] Verify delete operation completes without errors
- [ ] Cleanup: Ensure list is clean

### E2E Test: Add Item with Due Date (3/8)
- [ ] File: `tests/e2e/add-item-with-due-date.spec.js`
- [ ] Navigate to app and wait for items list
- [ ] Enter item name in form
- [ ] Set due date using date picker
- [ ] Click "Add Item" button
- [ ] Verify new item appears in list
- [ ] Verify due date displays with item
- [ ] Cleanup: Delete the created item

### E2E Test: Form Validation (4/8)
- [ ] File: `tests/e2e/form-validation.spec.js`
- [ ] Navigate to app
- [ ] Attempt to submit empty form
- [ ] Verify validation error is shown or button is disabled
- [ ] Enter whitespace-only item name
- [ ] Verify validation rejects it
- [ ] Verify clear error message is displayed
- [ ] Enter valid item name
- [ ] Verify form can be submitted

### E2E Test: Overdue Item Display (5/8)
- [ ] File: `tests/e2e/overdue-items.spec.js`
- [ ] Navigate to app
- [ ] Add item with past due date
- [ ] Verify overdue item is visually distinguished:
  - [ ] Check for "OVERDUE" badge or text
  - [ ] Verify overdue styling is applied (color, icon, etc.)
- [ ] Verify non-overdue items don't have overdue styling
- [ ] Cleanup: Delete test items

### E2E Test: Loading Indicator (6/8)
- [ ] File: `tests/e2e/loading-state.spec.js`
- [ ] Navigate to app
- [ ] Verify loading indicator appears while items are loading
- [ ] Wait for items to load
- [ ] Verify loading indicator disappears
- [ ] Verify items list is displayed
- [ ] Cleanup: N/A

### E2E Test: Error Handling (7/8)
- [ ] File: `tests/e2e/error-handling.spec.js`
- [ ] Test error on add operation:
  - [ ] Mock backend error response (optional, or test with invalid input)
  - [ ] Attempt invalid operation
  - [ ] Verify error message is displayed
  - [ ] Verify error message is contextual
- [ ] Test error on delete operation:
  - [ ] Trigger delete operation
  - [ ] If possible, simulate error
  - [ ] Verify error message displays
- [ ] Cleanup: Clear any test data

### E2E Test: Item Sort Order (8/8)
- [ ] File: `tests/e2e/item-sort-order.spec.js`
- [ ] Navigate to app
- [ ] Verify initial items are sorted newest first
- [ ] Add new item
- [ ] Verify new item appears at top of list
- [ ] Add another item
- [ ] Verify most recent item is at top
- [ ] Verify chronological order is maintained
- [ ] Cleanup: Delete added items

### General E2E Requirements
- [ ] All tests use `test.beforeEach()` and `test.afterEach()` for setup/cleanup
- [ ] All test data creation happens within test files (no fixtures)
- [ ] All tests clean up after themselves
- [ ] Tests are isolated and independent (no test interdependencies)
- [ ] Tests wait for elements properly (no hard timeouts)
- [ ] Tests use selectors consistently (`data-testid` preferred)
- [ ] POM pattern used for all page interactions

---

## PHASE 4: CODE QUALITY & STANDARDS

### DRY Principle
- [ ] Extract reusable API fetch functions (create utility module)
- [ ] Create shared error handling utility
- [ ] Extract form validation logic into reusable function
- [ ] Remove any duplicated code in tests
- [ ] Create shared test helpers for E2E tests

### Meaningful Names
- [ ] Review all function names for clarity and intent
- [ ] Review all variable names for searchability
- [ ] Review all component names for descriptiveness
- [ ] Ensure all names reveal their purpose

### Small, Focused Functions
- [ ] Refactor App.js if any functions are too large
- [ ] Ensure each function has single responsibility
- [ ] Keep functions short and testable
- [ ] Separate API calls, validation, and UI logic

### Error Handling
- [ ] Verify all try-catch blocks are explicit
- [ ] Verify error messages are meaningful
- [ ] Verify errors are logged appropriately
- [ ] Test error paths in unit tests

### Code Comments
- [ ] Remove obvious comments (code should be self-documenting)
- [ ] Add comments explaining *why* for non-obvious logic
- [ ] Keep comments concise and current
- [ ] Review and update comments with code changes

---

## PHASE 5: DEPLOYMENT & SCRIPTS

### npm Scripts Verification
- [ ] `npm run start` - Both frontend and backend run concurrently
- [ ] `npm test` - All unit tests pass
- [ ] `npm run test:integration` - Integration tests pass
- [ ] `npm run test:e2e` - All E2E tests pass
- [ ] `npm run test:all` - All tests pass together
- [ ] `npm run test:e2e:install` - Playwright browsers install successfully

### Development Environment
- [ ] Frontend runs on port 3000
- [ ] Backend runs on correct port (verify in proxy setting)
- [ ] Both services start in dev mode without errors
- [ ] Hot reload works for development
- [ ] No console errors on startup

### Environment & Configuration
- [ ] Verify `proxy` setting in frontend `package.json` matches backend port
- [ ] Verify no hardcoded URLs (use environment variables if needed)
- [ ] Database initializes correctly on startup
- [ ] Sample data loads automatically

---

## TESTING VERIFICATION CHECKLIST

### Coverage Goals
- [ ] Backend unit tests cover all endpoints
- [ ] Backend tests cover validation cases
- [ ] Backend tests cover error cases
- [ ] Frontend unit tests cover main features
- [ ] E2E tests cover 5-8 critical user journeys
- [ ] Overall code coverage meets project requirements (target: 80%+)

### Test Execution
- [ ] All unit tests pass: `npm run test`
- [ ] All integration tests pass: `npm run test:integration`
- [ ] All E2E tests pass: `npm run test:e2e`
- [ ] Tests run without warnings or deprecations
- [ ] Tests execute in reasonable time (<5 minutes for all)

---

## FINAL VERIFICATION

### Feature Completeness
- [ ] FR-1: Display Items List ✓
- [ ] FR-2: Add New Item ✓
- [ ] FR-3: Delete Item ✓
- [ ] FR-4: Error Handling ✓
- [ ] FR-5: Loading State ✓
- [ ] FR-6: Set Due Date ✓
- [ ] FR-7: Retrieve Items (Backend) ✓
- [ ] FR-8: Create Item (Backend) ✓
- [ ] FR-9: Delete Item (Backend) ✓
- [ ] FR-10: Data Persistence ✓

### Documentation
- [ ] README updated with setup and run instructions
- [ ] Code comments explain non-obvious logic
- [ ] Tests are clear and well-documented
- [ ] API endpoints documented
- [ ] Material UI theme configuration documented

### Code Quality
- [ ] No console errors or warnings
- [ ] ESLint passes (if configured)
- [ ] Code follows project style guide
- [ ] No dead code or unused imports
- [ ] Database cleanup on app shutdown (if applicable)

---

## SUMMARY

**Total Tasks: ~100+**

### Phase Breakdown
1. **Backend Development**: ~20 tasks
2. **Frontend Development**: ~40 tasks
3. **E2E Testing**: ~25 tasks
4. **Code Quality**: ~10 tasks
5. **Deployment & Verification**: ~10 tasks

---

**Start Date**: February 11, 2026  
**Target Completion**: After completing all phases  
**Current Status**: Not Started
