const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
let mongo; let server;
const assert = (ok, message) => { if (!ok) throw new Error(`FAIL: ${message}`); console.log(`  PASS: ${message}`); };
async function run() { try {
  mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri()); server = app.listen(0); const base = `http://localhost:${server.address().port}`;
  const request = async (path, method = 'GET', body, token) => { const r = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }); return { status: r.status, data: await r.json() }; };
  const registered = await request('/api/auth/register', 'POST', { fullName: 'Scheme Citizen', email: 'scheme@example.com', phone: '9876543212', password: 'StrongPassword123!', confirmPassword: 'StrongPassword123!' }); const token = registered.data.token;
  console.log('--- Scheme Eligibility API ---');
  assert((await request('/api/schemes')).status === 401, 'protects scheme data');
  const saved = await request('/api/schemes/profile', 'PUT', { state: 'Delhi', isFarmer: true, incomeTaxPayer: false, governmentEmployee: false, areaType: 'Urban', annualIncome: 400000, ownsPuccaHouse: false, category: 'SC', education: 'Post-matric / higher education', vaultConsent: true, vaultDocuments: [{ name: 'income-certificate.pdf', type: 'application/pdf' }], aadhaarAssistanceConsent: true }, token);
  assert(saved.status === 200 && saved.data.profile.vaultDocuments.length === 1 && !Object.prototype.hasOwnProperty.call(saved.data.profile, 'aadhaarNumber'), 'saves profile and consented Vault metadata without Aadhaar number');
  const recs = await request('/api/schemes/recommendations', 'GET', null, token);
  assert(recs.status === 200 && recs.data.recommendations.some((s) => s.status === 'Eligible') && recs.data.recommendations.every((s) => s.source && s.lastVerified && s.officialUrl), 'returns source-backed structured recommendations');
  const started = await request('/api/schemes/pm-kisan/start', 'POST', {}, token);
  assert(started.status === 201 && started.data.record.type === 'scheme_application' && started.data.officialUrl.includes('pmkisan.gov.in'), 'creates tracker record and returns official application link');
} finally { if (server) server.close(); if (mongoose.connection.readyState) await mongoose.disconnect(); if (mongo) await mongo.stop(); } }
run().catch((error) => { console.error(error.message || error); process.exitCode = 1; });
