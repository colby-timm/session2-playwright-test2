# Coding Guidelines

## DRY Principle

We follow the **DRY (Don't Repeat Yourself)** principle to maintain clean, maintainable code. Avoid duplicating logic across the codebase by:

- Extracting common functionality into reusable functions or utilities
- Creating shared components for repeated UI patterns
- Using helper functions to eliminate code duplication
- Centralizing configuration and constants

When you find yourself copying the same code blocks multiple times, refactor them into a single source of truth.

## Code Comments

Write self-documenting code that is clear without excessive comments. Comments should explain the *why*, not the *what*:

- **Avoid**: Comments that restate what the code obviously does
- **Use**: Comments to explain non-obvious logic, trade-offs, or important context
- Keep comments concise and maintained alongside code changes
- Use meaningful function and variable names that make intent obvious

## Clean Code: Top 5 Best Practices

### 1. **Meaningful Names**
Use clear, descriptive names for functions, variables, and classes that reveal intent. Names should be pronounceable and searchable.

```javascript
// Good
const getUserPreferences = (userId) => { ... }

// Avoid
const gup = (u) => { ... }
```

### 2. **Small, Focused Functions**
Functions should do one thing well. Aim for functions that are short, easy to understand, and testable. Long functions are harder to maintain and debug.

```javascript
// Good: Single responsibility
const validateEmail = (email) => { ... }
const sendEmail = (email, message) => { ... }

// Avoid: Multiple responsibilities
const validateAndSendEmail = (email, message) => { ... }
```

### 3. **Error Handling**
Use explicit error handling rather than relying on implicit failures or null checks. Make error cases obvious and manageable.

```javascript
// Good
try {
  await fetchData(url);
} catch (error) {
  logger.error('Failed to fetch data:', error);
  throw new FetchError('Unable to retrieve data');
}

// Avoid
const data = fetchData(url) || [];
```

### 4. **DRY Code**
Eliminate duplication by extracting common patterns into reusable functions and modules. This reduces bugs and makes changes easier.

```javascript
// Good: Shared utility
const formatDate = (date) => new Date(date).toISOString();

// Used across multiple places
const createdAt = formatDate(new Date());
const updatedAt = formatDate(new Date());
```

### 5. **Code Readability and Simplicity**
Write code that is easy to read and understand at first glance. Simplicity is more valuable than clever code. Use clear logic flow and avoid unnecessary complexity.

```javascript
// Good: Clear and straightforward
if (user.age >= 18) {
  return 'Adult';
}

// Avoid: Overly clever
return user.age >= 18 ? 'Adult' : 'Minor';
```
