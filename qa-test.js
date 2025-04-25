const assert = require('assert');
const fetch = require('node-fetch');
const Logger = require('./utils/logger');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

async function testAPI() {
  Logger.info('Starting API tests...\n');

  try {
    // Test root endpoint
    Logger.info('Testing root endpoint...');
    const rootResponse = await fetch(`${BASE_URL}/`);
    const rootData = await rootResponse.json();
    assert.strictEqual(rootResponse.status, 200);
    assert.strictEqual(rootData.status, 'success');
    Logger.success('Root endpoint test passed\n');

    // Test health endpoint
    Logger.info('Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    assert.strictEqual(healthResponse.status, 200);
    assert.strictEqual(healthData.status, 'healthy');
    Logger.success('Health endpoint test passed\n');

    // Test ticket creation
    Logger.info('Testing ticket creation...');
    const newTicket = {
      title: 'Test Ticket',
      description: 'This is a test ticket',
      status: 'open'
    };
    const createResponse = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket)
    });
    const createdTicket = await createResponse.json();
    assert.strictEqual(createResponse.status, 201);
    assert.strictEqual(createdTicket.data.title, newTicket.title);
    Logger.success('Ticket creation test passed\n');

    // Test getting all tickets
    Logger.info('Testing get all tickets...');
    const getTicketsResponse = await fetch(`${API_URL}/tickets`);
    const ticketsData = await getTicketsResponse.json();
    assert.strictEqual(getTicketsResponse.status, 200);
    assert(Array.isArray(ticketsData.data));
    Logger.success('Get all tickets test passed\n');

    // Test ticket search
    Logger.info('Testing ticket search...');
    const searchResponse = await fetch(`${API_URL}/tickets/search?query=test`);
    const searchData = await searchResponse.json();
    assert.strictEqual(searchResponse.status, 200);
    assert(Array.isArray(searchData.data));
    Logger.success('Ticket search test passed\n');

    // Test ticket update
    if (createdTicket._id) {
      Logger.info('Testing ticket update...');
      const updateData = { status: 'in-progress' };
      const updateResponse = await fetch(`${API_URL}/tickets/${createdTicket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const updatedTicket = await updateResponse.json();
      assert.strictEqual(updateResponse.status, 200);
      assert.strictEqual(updatedTicket.data.status, 'in-progress');
      Logger.success('Ticket update test passed\n');
    }

    // Test ticket deletion
    if (createdTicket.data && createdTicket.data._id) {
      Logger.info('Testing ticket deletion...');
      const deleteResponse = await fetch(`${API_URL}/tickets/${createdTicket.data._id}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      assert.strictEqual(deleteResponse.status, 200);
      assert.strictEqual(deleteData.status, 'success');
      Logger.success('Ticket deletion test passed\n');
    }

    Logger.success('All tests passed successfully! 🎉');
  } catch (error) {
    Logger.error(`Test failed: ${error.message}`);
    if (error.response) {
      Logger.error(`Response status: ${error.response.status}`);
      Logger.error(`Response body: ${await error.response.text()}`);
    }
    process.exit(1);
  }
}

// Run the tests
testAPI(); 