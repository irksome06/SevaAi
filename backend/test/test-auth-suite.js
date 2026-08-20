const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
process.env.NODE_ENV = 'test';
const app = require('../src/app');

let mongoServer;
let server;
let baseUrl;

async function runTestSuite() {
  console.log('====================================================');
  console.log('    🧪 RUNNING SEVAAI AUTHENTICATION TEST SUITE     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, description) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  try {
    // 1. Setup in-memory MongoDB
    console.log('[Setup] Initializing in-memory MongoDB...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('[Setup] Connected to in-memory test database.\n');

    // 2. Start test HTTP server
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Helper for JSON requests
    async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await res.json();
      return { status: res.status, data };
    }

    // TEST 1: Health Check Endpoint
    console.log('--- Test Suite 1: System Health ---');
    const health = await apiRequest('/api/health');
    assert(health.status === 200 && health.data.status === 'OK', 'GET /api/health returns 200 OK');

    // TEST 2: Email + Password Registration
    console.log('\n--- Test Suite 2: Registration Validation & Success ---');
    
    // Short password check
    const regShortPass = await apiRequest('/api/auth/register', 'POST', {
      fullName: 'Ramesh Kumar',
      email: 'ramesh@example.com',
      phone: '9876543210',
      password: '123',
      confirmPassword: '123',
      preferredLanguage: 'hi',
    });
    assert(regShortPass.status === 400, 'Registration rejects password shorter than 8 characters');

    // Password mismatch check
    const regMismatch = await apiRequest('/api/auth/register', 'POST', {
      fullName: 'Ramesh Kumar',
      email: 'ramesh@example.com',
      phone: '9876543210',
      password: 'StrongPassword123!',
      confirmPassword: 'DifferentPassword456!',
      preferredLanguage: 'hi',
    });
    assert(regMismatch.status === 400, 'Registration rejects mismatching confirmPassword');

    // Valid registration
    const regValid = await apiRequest('/api/auth/register', 'POST', {
      fullName: 'Ramesh Kumar',
      email: 'ramesh@example.com',
      phone: '9876543210',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      preferredLanguage: 'hi',
    });
    assert(regValid.status === 201 && regValid.data.success === true, 'Successful citizen registration returns 201 Created');
    assert(!!regValid.data.token, 'Registration returns JWT authorization token');
    assert(regValid.data.user.email === 'ramesh@example.com', 'Registration returns sanitized user profile');
    assert(regValid.data.user.password === undefined, 'Password is NOT exposed in response payload');

    const citizenToken = regValid.data.token;

    // Duplicate email registration check
    const regDup = await apiRequest('/api/auth/register', 'POST', {
      fullName: 'Another Ramesh',
      email: 'ramesh@example.com',
      phone: '9876543211',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      preferredLanguage: 'en',
    });
    assert(regDup.status === 400, 'Registration rejects duplicate email addresses');

    // TEST 3: Email + Password Login
    console.log('\n--- Test Suite 3: Email + Password Login ---');
    
    // Wrong password
    const loginWrong = await apiRequest('/api/auth/login', 'POST', {
      email: 'ramesh@example.com',
      password: 'WrongPassword999',
    });
    assert(loginWrong.status === 401, 'Login rejects incorrect password with 401 Unauthorized');

    // Valid login
    const loginValid = await apiRequest('/api/auth/login', 'POST', {
      email: 'ramesh@example.com',
      password: 'StrongPassword123!',
    });
    assert(loginValid.status === 200 && !!loginValid.data.token, 'Successful login returns 200 OK and JWT token');
    assert(loginValid.data.user.preferredLanguage === 'hi', 'User profile preserves preferred language setting');

    // TEST 4: Protected Profile Endpoint (GET /api/auth/me)
    console.log('\n--- Test Suite 4: Protected Routes & Auth Middleware ---');
    
    // Without token
    const noToken = await apiRequest('/api/auth/me', 'GET');
    assert(noToken.status === 401, 'Protected route /api/auth/me rejects request without token');

    // With invalid token
    const badToken = await apiRequest('/api/auth/me', 'GET', null, 'invalid.jwt.token');
    assert(badToken.status === 401, 'Protected route /api/auth/me rejects malformed token');

    // With valid token
    const validMe = await apiRequest('/api/auth/me', 'GET', null, citizenToken);
    assert(validMe.status === 200 && validMe.data.user.fullName === 'Ramesh Kumar', 'Authenticated GET /api/auth/me returns citizen profile');

    // TEST 5: Phone Number + OTP Authentication Flow
    console.log('\n--- Test Suite 5: Phone Number + OTP Flow ---');

    // Invalid phone number format
    const badPhone = await apiRequest('/api/auth/send-otp', 'POST', { phone: '12345' });
    assert(badPhone.status === 400, 'Rejects invalid non-Indian phone numbers');

    // Valid Indian phone number (+91 9876543210)
    const sendOtpRes = await apiRequest('/api/auth/send-otp', 'POST', { phone: '9876543210' });
    assert(sendOtpRes.status === 200 && sendOtpRes.data.success === true, 'POST /api/auth/send-otp generates and sends 6-digit OTP');
    assert(sendOtpRes.data.phone === '+919876543210', 'Phone number is properly standardized with +91 prefix');
    assert(!!sendOtpRes.data.devOtp && sendOtpRes.data.devOtp.length === 6, 'Dev OTP is provided for testing');

    const receivedOtp = sendOtpRes.data.devOtp;

    // Verify with invalid OTP code
    const invalidVerify = await apiRequest('/api/auth/verify-otp', 'POST', {
      phone: '9876543210',
      otp: '000000',
    });
    assert(invalidVerify.status === 400 && invalidVerify.data.reason === 'INVALID_OTP', 'Rejects incorrect OTP with INVALID_OTP reason code');

    // Verify with valid OTP code
    const validVerify = await apiRequest('/api/auth/verify-otp', 'POST', {
      phone: '9876543210',
      otp: receivedOtp,
      fullName: 'Priya Sharma',
      preferredLanguage: 'ta',
    });
    assert(validVerify.status === 200 && validVerify.data.success === true, 'POST /api/auth/verify-otp successfully authenticates phone number');
    assert(!!validVerify.data.token, 'OTP verification returns session JWT token');
    assert(validVerify.data.user.phone === '+919876543210', 'Citizen user record is created/associated with phone number');
    assert(validVerify.data.user.preferredLanguage === 'ta', 'Citizen preferred language is saved');

    // Verify that OTP cannot be re-used
    const reuseVerify = await apiRequest('/api/auth/verify-otp', 'POST', {
      phone: '9876543210',
      otp: receivedOtp,
    });
    assert(reuseVerify.status === 410 || reuseVerify.status === 400, 'Used OTP is deleted and cannot be re-used');

    console.log('\n====================================================');
    console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('[TestSuite] Unhandled error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runTestSuite();
