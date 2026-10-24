const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

process.env.NODE_ENV = 'test';
const app = require('./src/server.js');
const User = require('./src/models/User');

function request(method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = url;
    req.headers = Object.assign(
      {
        host: 'localhost:5000',
        'content-type': 'application/json',
      },
      headers
    );

    const res = new http.ServerResponse(req);
    let responseBody = '';

    res.write = function (chunk) {
      if (chunk) responseBody += chunk.toString();
      return true;
    };

    res.end = function (chunk) {
      if (chunk) responseBody += chunk.toString();
      let parsed = null;
      try {
        parsed = JSON.parse(responseBody);
      } catch (e) {
        parsed = responseBody;
      }
      resolve({
        status: res.statusCode,
        body: parsed,
      });
    };

    if (body) {
      const data = JSON.stringify(body);
      req.headers['content-length'] = Buffer.byteLength(data);
      // Simulate readable stream data event
      app.handle(req, res);
      req.emit('data', Buffer.from(data));
      req.emit('end');
    } else {
      app.handle(req, res);
      req.emit('end');
    }
  });
}

async function runAuthTests() {
  console.log('🔄 Connecting to database for authentication verification...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to Atlas. Cleaning up previous test student accounts...');

  const testEmail = `student.test.${Date.now()}@testuniv.edu`;
  const testPassword = 'SecureStudentPass2026!';
  const testName = 'Najva Student';

  const results = [];

  // 1. Missing Fields Registration Test
  console.log('\n--- 1. Testing Registration with Missing Fields ---');
  const resMissing = await request('POST', '/api/auth/register', { email: testEmail });
  console.log('Status:', resMissing.status, 'Body:', resMissing.body);
  results.push({
    test: 'Registration Missing Fields',
    expected: 400,
    actual: resMissing.status,
    passed: resMissing.status === 400 && resMissing.body.success === false,
  });

  // 2. Short Password Registration Test (<6 characters)
  console.log('\n--- 2. Testing Registration with Short Password (< 6 chars) ---');
  const resShortPass = await request('POST', '/api/auth/register', {
    name: testName,
    email: testEmail,
    password: '123',
  });
  console.log('Status:', resShortPass.status, 'Body:', resShortPass.body);
  results.push({
    test: 'Registration Short Password',
    expected: 400,
    actual: resShortPass.status,
    passed: resShortPass.status === 400,
  });

  // 3. Valid Registration Test
  console.log('\n--- 3. Testing Valid User Registration ---');
  const resRegister = await request('POST', '/api/auth/register', {
    name: testName,
    email: testEmail,
    password: testPassword,
    department: 'Computer Science',
    semester: 'S4',
  });
  console.log('Status:', resRegister.status);
  console.log('Received Token?:', !!resRegister.body.token);
  console.log('User in response has password exposed?:', 'password' in (resRegister.body.user || {}));
  results.push({
    test: 'Valid Registration',
    expected: 201,
    actual: resRegister.status,
    passed:
      resRegister.status === 201 &&
      !!resRegister.body.token &&
      !('password' in resRegister.body.user),
  });

  const authToken = resRegister.body.token;
  const registeredUserId = resRegister.body.user._id;

  // 4. Duplicate Registration Test
  console.log('\n--- 4. Testing Duplicate Email Registration ---');
  const resDuplicate = await request('POST', '/api/auth/register', {
    name: 'Duplicate Student',
    email: testEmail,
    password: testPassword,
  });
  console.log('Status:', resDuplicate.status, 'Body:', resDuplicate.body);
  results.push({
    test: 'Duplicate Email Registration',
    expected: 409,
    actual: resDuplicate.status,
    passed: resDuplicate.status === 409,
  });

  // 5. Valid Login Test
  console.log('\n--- 5. Testing Login with Valid Credentials ---');
  const resLogin = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  console.log('Status:', resLogin.status);
  console.log('Login Token Issued?:', !!resLogin.body.token);
  console.log('User in response has password exposed?:', 'password' in (resLogin.body.user || {}));
  results.push({
    test: 'Valid Login',
    expected: 200,
    actual: resLogin.status,
    passed: resLogin.status === 200 && !!resLogin.body.token && !('password' in resLogin.body.user),
  });

  // 6. Invalid Password Login Test
  console.log('\n--- 6. Testing Login with Wrong Password ---');
  const resWrongPass = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: 'WrongPassword999',
  });
  console.log('Status:', resWrongPass.status, 'Body:', resWrongPass.body);
  results.push({
    test: 'Wrong Password Login',
    expected: 401,
    actual: resWrongPass.status,
    passed: resWrongPass.status === 401 && resWrongPass.body.success === false,
  });

  // 7. Non-existent User Login Test
  console.log('\n--- 7. Testing Login with Non-Existent Email ---');
  const resNonExistent = await request('POST', '/api/auth/login', {
    email: 'nobody@nowhere.edu',
    password: testPassword,
  });
  console.log('Status:', resNonExistent.status, 'Body:', resNonExistent.body);
  results.push({
    test: 'Non-Existent Email Login',
    expected: 401,
    actual: resNonExistent.status,
    passed: resNonExistent.status === 401,
  });

  // 8. Protected GET /api/auth/me without Token
  console.log('\n--- 8. Testing Protected /api/auth/me Without Token ---');
  const resNoToken = await request('GET', '/api/auth/me');
  console.log('Status:', resNoToken.status, 'Body:', resNoToken.body);
  results.push({
    test: 'Protected Route Without Token',
    expected: 401,
    actual: resNoToken.status,
    passed: resNoToken.status === 401,
  });

  // 9. Protected GET /api/auth/me with Invalid Token
  console.log('\n--- 9. Testing Protected /api/auth/me With Malformed/Invalid Token ---');
  const resBadToken = await request('GET', '/api/auth/me', null, {
    authorization: 'Bearer invalid.token.payload',
  });
  console.log('Status:', resBadToken.status, 'Body:', resBadToken.body);
  results.push({
    test: 'Protected Route With Invalid Token',
    expected: 401,
    actual: resBadToken.status,
    passed: resBadToken.status === 401,
  });

  // 10. Protected GET /api/auth/me with Valid Token
  console.log('\n--- 10. Testing Protected /api/auth/me With Valid Bearer Token ---');
  const resMe = await request('GET', '/api/auth/me', null, {
    authorization: `Bearer ${authToken}`,
  });
  console.log('Status:', resMe.status, 'Profile data:', resMe.body);
  results.push({
    test: 'Protected /api/auth/me With Token',
    expected: 200,
    actual: resMe.status,
    passed:
      resMe.status === 200 &&
      resMe.body.success === true &&
      resMe.body.user.email === testEmail &&
      !('password' in resMe.body.user),
  });

  // Clean up test user document from MongoDB Atlas
  console.log('\n🧹 Cleaning up test user document from Atlas...');
  await User.deleteOne({ _id: registeredUserId });
  console.log('✅ Cleaned up.');

  console.log('\n=======================================');
  console.log('TEST SUMMARY TABLE:');
  console.log('=======================================');
  console.table(results);

  await mongoose.disconnect();
  const allPassed = results.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runAuthTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
