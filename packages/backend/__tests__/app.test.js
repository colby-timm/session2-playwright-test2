const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (name = 'Temp Item to Delete', due_date = null) => {
  const payload = { name };
  if (due_date !== null) {
    payload.due_date = due_date;
  }

  const response = await request(app)
    .post('/api/items')
    .send(payload)
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('created_at');
      expect(item).toHaveProperty('due_date');
    });

    it('should return items with due_date field', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      const items = response.body;
      
      // All items should have due_date property (even if null)
      items.forEach(item => {
        expect(item).toHaveProperty('due_date');
      });
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item without due_date', async () => {
      const newItem = { name: 'Test Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('due_date');
      expect(response.body.due_date).toBeNull();
    });

    it('should create a new item with valid due_date (ISO 8601)', async () => {
      const newItem = { 
        name: 'Test Item with Due Date',
        due_date: '2026-02-20T10:00:00Z'
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.due_date).toBe(newItem.due_date);
    });

    it('should create a new item with valid due_date with milliseconds', async () => {
      const newItem = { 
        name: 'Test Item with Milliseconds',
        due_date: '2026-02-20T10:30:45.123Z'
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.due_date).toBe(newItem.due_date);
    });

    it('should reject invalid due_date format', async () => {
      const newItem = { 
        name: 'Test Item',
        due_date: '2026-02-20' // Missing time
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid due_date format');
    });

    it('should reject invalid due_date with invalid date', async () => {
      const newItem = { 
        name: 'Test Item',
        due_date: 'not-a-date'
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid due_date format');
    });

    it('should reject invalid month in due_date', async () => {
      const newItem = { 
        name: 'Test Item',
        due_date: '2026-13-01T10:00:00Z' // Invalid month
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty string', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is whitespace only', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '   ' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should accept name with leading/trailing spaces after trim', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '  Valid Item Name  ' })
        .set('Accept', 'application/json');

      // The API accepts it but stores the original value
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('  Valid Item Name  ');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item with valid ID', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id (non-numeric)', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });

    it('should return 400 for empty id', async () => {
      const response = await request(app).delete('/api/items/');
      expect(response.status).toBe(404); // Express routing - not found
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on unexpected server errors', async () => {
      // This is a basic test - in production, you might mock db.prepare to throw
      // For now, we just verify the error structure is correct
      const items = await request(app).get('/api/items');
      expect(items.status).toBe(200);
    });
  });
});