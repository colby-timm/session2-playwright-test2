import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Define mock response data to avoid duplication across tests
const MOCK_ITEMS_RESPONSE = [
  { 
    id: 2, 
    name: 'Test Item 2', 
    created_at: '2023-01-02T00:00:00.000Z',
    due_date: '2026-02-15T10:00:00.000Z'
  },
  { 
    id: 1, 
    name: 'Test Item 1', 
    created_at: '2023-01-01T00:00:00.000Z',
    due_date: null
  },
];

/**
 * Helper function to create a standard API response for a newly created item
 * Reduces duplication in mock server handlers
 */
const createNewItemResponse = (name, dueDate = null) => ({
  id: 3,
  name,
  due_date: dueDate || null,
  created_at: new Date().toISOString(),
});

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(MOCK_ITEMS_RESPONSE));
  }),
  
  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name, due_date } = req.body;
    
    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }
    
    return res(ctx.status(201), ctx.json(createNewItemResponse(name, due_date)));
  }),

  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * Helper function to wait for list to load and items to appear
 * Reduces duplication in test setup
 */
const waitForListToLoad = async () => {
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
};

describe('App Component', () => {
  test('renders the header with title', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('To Do App')).toBeInTheDocument();
  });

  test('renders the subtitle', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Initially shows loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('displays items list with data-testid', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      const itemsList = screen.getByTestId('items-list');
      expect(itemsList).toBeInTheDocument();
    });
  });

  test('displays due date for items', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Due:/)).toBeInTheDocument();
    });
  });

  test('adds a new item', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitForListToLoad();
    
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, 'New Test Item');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
  });

  test('clears input field after successful submission', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitForListToLoad();
    
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, 'Test Item');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    await waitFor(() => {
      expect(nameInput.value).toBe('');
    });
  });

  test('rejects empty item name', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitForListToLoad();
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    const itemsList = screen.getByTestId('items-list');
    const listItems = itemsList.querySelectorAll('li');
    expect(listItems.length).toBe(2); // Only the initial 2 items
  });

  test('rejects whitespace-only item name', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitForListToLoad();
    
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, '   ');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    const itemsList = screen.getByTestId('items-list');
    const listItems = itemsList.querySelectorAll('li');
    expect(listItems.length).toBe(2); // Only the initial 2 items
  });

  test('deletes an item', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('delete-Test Item 1');
    await act(async () => {
      await user.click(deleteButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });
  });

  test('handles API error on fetch', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });

  test('displays error message on failed add', async () => {
    const user = userEvent.setup();
    
    server.use(
      rest.post('/api/items', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    await waitForListToLoad();
    
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, 'Test Item');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Error adding item/)).toBeInTheDocument();
    });
  });

  test('displays error message on failed delete', async () => {
    const user = userEvent.setup();
    
    server.use(
      rest.delete('/api/items/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('delete-Test Item 1');
    await act(async () => {
      await user.click(deleteButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Error deleting item/)).toBeInTheDocument();
    });
  });

  test('displays loading indicator during fetch', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Loading indicator should appear
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for it to disappear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});
