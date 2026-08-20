const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;
let server;

const assert = (condition, description) => {
  if (!condition) throw new Error(`FAIL: ${description}`);
  console.log(`  PASS: ${description}`);
};

async function run() {
  try {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    server = app.listen(0);
    const baseUrl = `http://localhost:${server.address().port}`;
    const request = async (path, method = 'GET', body, token) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: response.status, data: await response.json() };
    };
    const register = async (email, phone) => request('/api/auth/register', 'POST', {
      fullName: 'Tracker Test Citizen', email, phone, password: 'StrongPassword123!', confirmPassword: 'StrongPassword123!',
    });

    console.log('--- Application & Report Tracker API ---');
    const firstUser = await register('tracker-one@example.com', '9876543210');
    assert(firstUser.status === 201 && firstUser.data.token, 'registers a test citizen');
    const token = firstUser.data.token;
    const denied = await request('/api/tracking');
    assert(denied.status === 401, 'requires authentication');
    const list = await request('/api/tracking', 'GET', null, token);
    assert(list.status === 200 && list.data.records.length === 4, 'returns four user-specific seed records');
    const record = list.data.records[0];
    const detail = await request(`/api/tracking/${record.trackingId}`, 'GET', null, token);
    assert(detail.status === 200 && detail.data.record.trackingId === record.trackingId, 'returns a single owned record');
    const created = await request('/api/tracking', 'POST', { type: 'other', title: 'Test service request', sourceModule: 'Tracker test', status: 'Draft' }, token);
    assert(created.status === 201 && created.data.record.timeline.length === 1, 'creates a record with initial timeline entry');
    const updated = await request(`/api/tracking/${created.data.record.trackingId}/status`, 'PATCH', { status: 'Submitted', note: 'Submitted for testing.' }, token);
    assert(updated.status === 200 && updated.data.record.timeline.length === 2, 'updates status and appends timeline history');
    const summary = await request('/api/tracking/summary', 'GET', null, token);
    assert(summary.status === 200 && summary.data.summary.total === 5, 'returns summary statistics');
    const secondUser = await register('tracker-two@example.com', '9876543211');
    const otherRead = await request(`/api/tracking/${record.trackingId}`, 'GET', null, secondUser.data.token);
    assert(otherRead.status === 404, 'does not expose another citizen’s record');
    console.log('Tracker suite completed successfully.');
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

run().catch((error) => { console.error(error.message || error); process.exitCode = 1; });
