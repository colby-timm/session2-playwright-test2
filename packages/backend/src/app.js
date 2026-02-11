const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Use in-memory SQLite database for this demo
// In production, this would connect to a persistent database
const db = new Database(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TEXT
  )
`);

// Initialize with sample data
const initialItems = [
  { name: 'Item 1', due_date: '2026-02-20T10:00:00Z' },
  { name: 'Item 2', due_date: '2026-02-25T14:30:00Z' },
  { name: 'Item 3', due_date: null }
];
const insertStmt = db.prepare('INSERT INTO items (name, due_date) VALUES (?, ?)');

initialItems.forEach(item => {
  insertStmt.run(item.name, item.due_date);
});

console.log('Database initialized with sample data');

/**
 * Validates ISO 8601 datetime format because MySQL and many databases
 * require consistent date formatting for proper querying and sorting
 */
const validateDueDate = (dueDate) => {
  if (!dueDate) return true; // due_date is optional

  // ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DDTHH:mm:ss.sssZ
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

  if (!iso8601Regex.test(dueDate)) {
    return false;
  }

  // Verify it's a valid date (not just syntactically correct)
  const date = new Date(dueDate);
  return !isNaN(date.getTime());
};

// GET /api/items - Retrieve all items sorted by creation date (newest first)
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/items - Create a new item with optional due date
app.post('/api/items', (req, res) => {
  try {
    const { name, due_date } = req.body;

    // Validate name is non-empty string
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Validate due_date format if provided
    if (due_date !== undefined && !validateDueDate(due_date)) {
      return res.status(400).json({ error: 'Invalid due_date format. Use ISO 8601 format (e.g., 2026-02-20T10:00:00Z)' });
    }

    const result = insertStmt.run(name, due_date || null);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// DELETE /api/items/:id - Remove an item by ID
app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt };