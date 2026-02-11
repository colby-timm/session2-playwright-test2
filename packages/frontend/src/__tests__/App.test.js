import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
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
      ])
    );
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
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        due_date: due_date || null,
        created_at: new Date().toISOString(),
      })
    );
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
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Fill in the form and submit
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, 'New Test Item');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check that the new item appears
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
  });

  test('clears input field after successful submission', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Fill in and submit
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, 'Test Item');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Input should be cleared
    await waitFor(() => {
      expect(nameInput.value).toBe('');
    });
  });

  test('rejects empty item name', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click submit without entering anything
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Should not add a new item, no new item created
    const itemsList = screen.getByTestId('items-list');
    const listItems = itemsList.querySelectorAll('li');
    expect(listItems.length).toBe(2); // Only the initial 2 items
  });

  test('rejects whitespace-only item name', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Fill with whitespace
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, '   ');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Should not add a new item
    const itemsList = screen.getByTestId('items-list');
    const listItems = itemsList.querySelectorAll('li');
    expect(listItems.length).toBe(2); // Only the initial 2 items
  });

  test('deletes an item', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Find and click delete button for Test Item 1
    const deleteButton = screen.getByTestId('delete-Test Item 1');
    await act(async () => {
      await user.click(deleteButton);
    });
    
    // Item should be removed
    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });
  });

  test('handles API error on fetch', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No items found. Add some!')).toBeInTheDocument();
    });
  });

  test('displays error message on failed add', async () => {
    const user = userEvent.setup();
    
    // Override POST handler to return error
    server.use(
      rest.post('/api/items', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Try to add item
    const nameInput = screen.getByLabelText('Item Name');
    
    await act(async () => {
      await user.type(nameInput, 'Test Item');
    });
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Error adding item/)).toBeInTheDocument();
    });
  });

  test('displays error message on failed delete', async () => {
    const user = userEvent.setup();
    
    // Override DELETE handler to return error
    server.use(
      rest.delete('/api/items/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Try to delete
    const deleteButton = screen.getByTestId('delete-Test Item 1');
    await act(async () => {
      await user.click(deleteButton);
    });
    
    // Should show error message
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
