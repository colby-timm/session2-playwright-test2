const request = require('supertest');
const { app, db } = require('../../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Integration Tests - API Workflows', () => {
  describe('Item Lifecycle', () => {
    it('should create an item, retrieve it, and verify persistence', async () => {
      const itemName = 'Integration Test Item 1';
      
      // Create item
      const createResponse = await request(app)
        .post('/api/items')
        .send({ name: itemName })
        .set('Accept', 'application/json');
      
      expect(createResponse.status).toBe(201);
      const createdItem = createResponse.body;
      expect(createdItem.name).toBe(itemName);
      
      // Retrieve all items and verify the created item is there
      const getResponse = await request(app).get('/api/items');
      expect(getResponse.status).toBe(200);
      
      const foundItem = getResponse.body.find(item => item.id === createdItem.id);
      expect(foundItem).toBeDefined();
      expect(foundItem.name).toBe(itemName);
      expect(foundItem.created_at).toBe(createdItem.created_at);
    });

    it('should create item with due date, retrieve it, and verify due date persistence', async () => {
      const itemData = {
        name: 'Item with Due Date',
        due_date: '2026-03-15T14:30:00Z'
      };
      
      // Create item with due date
      const createResponse = await request(app)
        .post('/api/items')
        .send(itemData)
        .set('Accept', 'application/json');
      
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.due_date).toBe(itemData.due_date);
      
      // Retrieve and verify due date is persisted
      const getResponse = await request(app).get('/api/items');
      const foundItem = getResponse.body.find(item => item.id === createResponse.body.id);
      
      expect(foundItem.due_date).toBe(itemData.due_date);
    });

    it('should create item, delete it, and verify it is removed', async () => {
      // Create item
      const createResponse = await request(app)
        .post('/api/items')
        .send({ name: 'Item To Delete' })
        .set('Accept', 'application/json');
      
      expect(createResponse.status).toBe(201);
      const itemId = createResponse.body.id;
      
      // Verify item exists in list
      let getResponse = await request(app).get('/api/items');
      let foundItem = getResponse.body.find(item => item.id === itemId);
      expect(foundItem).toBeDefined();
      
      // Delete item
      const deleteResponse = await request(app).delete(`/api/items/${itemId}`);
      expect(deleteResponse.status).toBe(200);
      
      // Verify item is no longer in list
      getResponse = await request(app).get('/api/items');
      foundItem = getResponse.body.find(item => item.id === itemId);
      expect(foundItem).toBeUndefined();
    });
  });

  describe('Sorting and Order', () => {
    it('should retrieve all items consistently', async () => {
      const timestamp = Date.now();
      const itemName1 = 'First Item - ' + timestamp;
      const itemName2 = 'Second Item - ' + timestamp;
      const itemName3 = 'Third Item - ' + timestamp;
      
      // Create items in sequence with delays to ensure different timestamps
      const response1 = await request(app)
        .post('/api/items')
        .send({ name: itemName1 });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const response2 = await request(app)
        .post('/api/items')
        .send({ name: itemName2 });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const response3 = await request(app)
        .post('/api/items')
        .send({ name: itemName3 });
      
      // Retrieve all items
      const getResponse = await request(app).get('/api/items');
      const items = getResponse.body;
      
      // Find our test items by name
      const testItems = items.filter(item => 
        item.name === itemName1 || item.name === itemName2 || item.name === itemName3
      );
      
      // Verify all three items are returned
      expect(testItems.length).toBe(3);
      
      // Verify items have proper structure with timestamps
      testItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('created_at');
        expect(item).toHaveProperty('due_date');
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent item creations correctly', async () => {
      const itemNames = [
        'Concurrent 1 - ' + Date.now(),
        'Concurrent 2 - ' + Date.now(),
        'Concurrent 3 - ' + Date.now()
      ];
      
      // Create multiple items concurrently
      const responses = await Promise.all(
        itemNames.map(name =>
          request(app)
            .post('/api/items')
            .send({ name })
        )
      );
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('created_at');
      });
      
      // Retrieve all items and verify all were created
      const getResponse = await request(app).get('/api/items');
      const createdIds = responses.map(r => r.body.id);
      const foundItems = getResponse.body.filter(item => createdIds.includes(item.id));
      
      expect(foundItems.length).toBe(3);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve item name exactly as provided', async () => {
      const itemName = '  Item with Spaces  ';
      
      const createResponse = await request(app)
        .post('/api/items')
        .send({ name: itemName });
      
      expect(createResponse.body.name).toBe(itemName);
      
      // Verify it's stored correctly
      const getResponse = await request(app).get('/api/items');
      const foundItem = getResponse.body.find(item => item.id === createResponse.body.id);
      expect(foundItem.name).toBe(itemName);
    });

    it('should maintain created_at timestamp across create and retrieve', async () => {
      const createResponse = await request(app)
        .post('/api/items')
        .send({ name: 'Timestamp Test Item' });
      
      const createdAt = createResponse.body.created_at;
      
      // Retrieve item and verify timestamp matches
      const getResponse = await request(app).get('/api/items');
      const foundItem = getResponse.body.find(item => item.id === createResponse.body.id);
      
      expect(foundItem.created_at).toBe(createdAt);
    });
  });

  describe('Error Recovery', () => {
    it('should allow normal operations after a failed request', async () => {
      // Make invalid request
      const invalidResponse = await request(app)
        .post('/api/items')
        .send({ name: '' }); // Empty name
      
      expect(invalidResponse.status).toBe(400);
      
      // Verify normal requests still work
      const validResponse = await request(app)
        .post('/api/items')
        .send({ name: 'Valid Item After Error' });
      
      expect(validResponse.status).toBe(201);
      expect(validResponse.body).toHaveProperty('id');
    });

    it('should allow operations after trying to delete non-existent item', async () => {
      // Try to delete non-existent item
      const deleteResponse = await request(app).delete('/api/items/999999999');
      expect(deleteResponse.status).toBe(404);
      
      // Verify normal operations work
      const createResponse = await request(app)
        .post('/api/items')
        .send({ name: 'Item After Failed Delete' });
      
      expect(createResponse.status).toBe(201);
    });
  });

  describe('Due Date Handling', () => {
    it('should mix items with and without due dates correctly', async () => {
      const itemWithoutDue = await request(app)
        .post('/api/items')
        .send({ name: 'No Due Date Item' });
      
      const itemWithDue = await request(app)
        .post('/api/items')
        .send({ 
          name: 'With Due Date Item',
          due_date: '2026-04-01T09:00:00Z'
        });
      
      expect(itemWithoutDue.status).toBe(201);
      expect(itemWithDue.status).toBe(201);
      
      // Retrieve and verify both exist with correct due_date values
      const getResponse = await request(app).get('/api/items');
      
      const foundWithoutDue = getResponse.body.find(item => item.id === itemWithoutDue.body.id);
      const foundWithDue = getResponse.body.find(item => item.id === itemWithDue.body.id);
      
      expect(foundWithoutDue.due_date).toBeNull();
      expect(foundWithDue.due_date).toBe('2026-04-01T09:00:00Z');
    });
  });
});
