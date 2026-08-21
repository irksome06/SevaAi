/**
 * Test script for SevaAI AI Service Controller
 */
const { chat } = require('../src/controllers/aiController');

async function runTests() {
  console.log('Testing SevaAI AI Controller...');

  // Mock response object
  const createMockRes = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      }
    };
    return res;
  };

  // Test 1: General Greeting in English
  const req1 = { body: { message: 'Hello, how can you help me?' } };
  const res1 = createMockRes();
  await chat(req1, res1, () => {});
  console.log('\n[Test 1] English Greeting:');
  console.log('Status:', res1.statusCode);
  console.log('Provider:', res1.jsonData?.provider);
  console.log('Response Snippet:', res1.jsonData?.message?.slice(0, 120) + '...');

  // Test 2: PM-KISAN in Hindi
  const req2 = { body: { message: 'PM Kisan yojana ke baare me batao', language: 'hi' } };
  const res2 = createMockRes();
  await chat(req2, res2, () => {});
  console.log('\n[Test 2] PM-KISAN Hindi:');
  console.log('Status:', res2.statusCode);
  console.log('Provider:', res2.jsonData?.provider);
  console.log('Response Snippet:', res2.jsonData?.message?.slice(0, 120) + '...');

  // Test 3: Civic Pothole issue
  const req3 = { body: { message: 'How do I report a road pothole?' } };
  const res3 = createMockRes();
  await chat(req3, res3, () => {});
  console.log('\n[Test 3] Civic Pothole Query:');
  console.log('Status:', res3.statusCode);
  console.log('Provider:', res3.jsonData?.provider);
  console.log('Response Snippet:', res3.jsonData?.message?.slice(0, 120) + '...');

  // Test 4: RTI Guide
  const req4 = { body: { message: 'How to file an RTI application?' } };
  const res4 = createMockRes();
  await chat(req4, res4, () => {});
  console.log('\n[Test 4] RTI Query:');
  console.log('Status:', res4.statusCode);
  console.log('Provider:', res4.jsonData?.provider);
  console.log('Response Snippet:', res4.jsonData?.message?.slice(0, 120) + '...');

  // Test 5: Helplines
  const req5 = { body: { message: 'What is the emergency helpline number?' } };
  const res5 = createMockRes();
  await chat(req5, res5, () => {});
  console.log('\n[Test 5] Helpline Query:');
  console.log('Status:', res5.statusCode);
  console.log('Provider:', res5.jsonData?.provider);
  console.log('Response Snippet:', res5.jsonData?.message?.slice(0, 120) + '...');

  console.log('\nAll tests completed successfully!');
}

runTests().catch(console.error);
