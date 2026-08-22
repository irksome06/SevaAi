const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer; let server;
const assert = (value, message) => { if (!value) throw new Error(`FAIL: ${message}`); console.log(`  PASS: ${message}`); };

async function run() {
  try {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    server = app.listen(0);
    const base = `http://localhost:${server.address().port}`;
    const request = async (path, method = 'GET', body, token) => {
      const response = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, data: await response.json() };
    };
    const registration = await request('/api/auth/register', 'POST', { fullName: 'Quick Access Test', email: 'quick-access@example.com', phone: '9876543212', password: 'StrongPassword123!', confirmPassword: 'StrongPassword123!' });
    assert(registration.status === 201, 'creates test citizen');
    const token = registration.data.token;
    const unauthenticated = await request('/api/quick-access');
    assert(unauthenticated.status === 401, 'protects Quick Access endpoints');
    const all = await request('/api/quick-access', 'GET', null, token);
    assert(all.status === 200 && all.data.entries.length === 9, 'returns non-duplicated official seed directory records');
    assert(all.data.entries.every((entry) => entry.officialSource && entry.lastVerified && entry.phone), 'includes source, verified date and call number for every record');
    const emergency = await request('/api/quick-access?category=Emergency', 'GET', null, token);
    assert(emergency.data.entries.length === 1 && emergency.data.entries[0].phone === '112', 'filters by category');
    const delhi = await request('/api/quick-access?state=Delhi&city=New%20Delhi&district=New%20Delhi', 'GET', null, token);
    assert(delhi.data.entries.length === 9 && delhi.data.entries.filter((entry) => entry.state === 'Delhi').length === 6, 'filters Delhi office entries while retaining nationwide services');
    const maharashtra = await request('/api/quick-access?state=Maharashtra', 'GET', null, token);
    assert(maharashtra.data.entries.length === 3 && maharashtra.data.entries.every((entry) => entry.state === 'All India'), 'keeps nationwide services available for every State/UT');
    const search = await request('/api/quick-access?search=rail', 'GET', null, token);
    assert(search.data.entries.length === 1 && search.data.entries[0].phone === '139', 'searches by service name');
    const facets = await request('/api/quick-access/filters', 'GET', null, token);
    assert(facets.status === 200 && facets.data.filters.states.includes('Delhi') && facets.data.filters.states.includes('Maharashtra'), 'returns all-India State/UT filter facets');
    const detail = await request(`/api/quick-access/${all.data.entries[0]._id}`, 'GET', null, token);
    assert(detail.status === 200 && detail.data.entry.name, 'returns individual directory entry');
    console.log('Quick Access suite completed successfully.');
  } finally { if (server) server.close(); if (mongoose.connection.readyState) await mongoose.disconnect(); if (mongoServer) await mongoServer.stop(); }
}
run().catch((error) => { console.error(error.message || error); process.exitCode = 1; });
