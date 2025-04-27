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

    // Test ticket creation without identifier
    Logger.info('Testing ticket creation without identifier...');
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
    assert.strictEqual(createdTicket.data.identifier, undefined);
    Logger.success('Ticket creation without identifier test passed\n');

    // Test ticket creation with identifier
    Logger.info('Testing ticket creation with identifier...');
    const newTicketWithId = {
      title: 'Test Ticket with ID',
      description: 'This is a test ticket with identifier',
      status: 'open',
      identifier: 'DG-1'
    };
    const createWithIdResponse = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicketWithId)
    });
    const createdTicketWithId = await createWithIdResponse.json();
    assert.strictEqual(createWithIdResponse.status, 201);
    assert.strictEqual(createdTicketWithId.data.title, newTicketWithId.title);
    assert.strictEqual(createdTicketWithId.data.identifier, newTicketWithId.identifier);
    Logger.success('Ticket creation with identifier test passed\n');

    // Test getting ticket by identifier
    Logger.info('Testing get ticket by identifier...');
    const getByIdentifierResponse = await fetch(`${API_URL}/tickets?id=${newTicketWithId.identifier}`);
    const ticketByIdentifier = await getByIdentifierResponse.json();
    assert.strictEqual(getByIdentifierResponse.status, 200);
    assert.strictEqual(ticketByIdentifier.data.identifier, newTicketWithId.identifier);
    Logger.success('Get ticket by identifier test passed\n');

    // Test getting all tickets with identifier filter
    Logger.info('Testing get tickets with identifier filter...');
    const getWithFilterResponse = await fetch(`${API_URL}/tickets?identifier=${newTicketWithId.identifier}`);
    const filteredTickets = await getWithFilterResponse.json();
    assert.strictEqual(getWithFilterResponse.status, 200);
    assert(Array.isArray(filteredTickets.data));
    assert(filteredTickets.data.length > 0);
    assert.strictEqual(filteredTickets.data[0].identifier, newTicketWithId.identifier);
    Logger.success('Get tickets with identifier filter test passed\n');

    // Test updating ticket identifier
    Logger.info('Testing update ticket identifier...');
    const updateData = { identifier: 'DG-2' };
    const updateResponse = await fetch(`${API_URL}/tickets/${createdTicketWithId.data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const updatedTicket = await updateResponse.json();
    assert.strictEqual(updateResponse.status, 200);
    assert.strictEqual(updatedTicket.data.identifier, updateData.identifier);
    Logger.success('Update ticket identifier test passed\n');

    // Test removing ticket identifier
    Logger.info('Testing remove ticket identifier...');
    const removeIdData = { identifier: null };
    const removeIdResponse = await fetch(`${API_URL}/tickets/${updatedTicket.data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(removeIdData)
    });
    const removedIdTicket = await removeIdResponse.json();
    assert.strictEqual(removeIdResponse.status, 200);
    assert.strictEqual(removedIdTicket.data.identifier, null);
    Logger.success('Remove ticket identifier test passed\n');

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

    // Test ticket deletion
    Logger.info('Testing ticket deletion...');
    const deleteResponse = await fetch(`${API_URL}/tickets/${createdTicket.data._id}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteResponse.json();
    assert.strictEqual(deleteResponse.status, 200);
    assert.strictEqual(deleteData.status, 'success');
    Logger.success('Ticket deletion test passed\n');

    // Test ticket creation with custom fields
    Logger.info('Testing ticket creation with custom fields...');
    const customTicket = {
      title: 'Custom Fields Ticket',
      description: 'This ticket has custom fields',
      status: 'open',
      customField1: 'value1',
      customField2: 123,
      customField3: {
        nested: 'value',
        array: [1, 2, 3]
      },
      tags: ['urgent', 'feature'],
      metadata: {
        source: 'api',
        createdBy: 'test'
      }
    };
    const customResponse = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customTicket)
    });
    const createdCustomTicket = await customResponse.json();
    assert.strictEqual(customResponse.status, 201);
    assert.strictEqual(createdCustomTicket.data.title, customTicket.title);
    assert.strictEqual(createdCustomTicket.data.customField1, customTicket.customField1);
    assert.strictEqual(createdCustomTicket.data.customField2, customTicket.customField2);
    assert.deepStrictEqual(createdCustomTicket.data.customField3, customTicket.customField3);
    assert.deepStrictEqual(createdCustomTicket.data.tags, customTicket.tags);
    assert.deepStrictEqual(createdCustomTicket.data.metadata, customTicket.metadata);
    Logger.success('Ticket creation with custom fields test passed\n');

    // Delete the custom ticket
    await fetch(`${API_URL}/tickets/${createdCustomTicket.data._id}`, {
      method: 'DELETE'
    });

    // Delete the ticket with identifier
    await fetch(`${API_URL}/tickets/${createdTicketWithId.data._id}`, {
      method: 'DELETE'
    });

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

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MOCK_SERVICES = 'true';

// Run the tests
testAPI(); 