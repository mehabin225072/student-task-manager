const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

process.env.NODE_ENV = 'test';
const app = require('./src/server.js');
const User = require('./src/models/User');
const Task = require('./src/models/Task');

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
      app.handle(req, res);
      req.emit('data', Buffer.from(data));
      req.emit('end');
    } else {
      app.handle(req, res);
      req.emit('end');
    }
  });
}

async function runTaskTests() {
  console.log('🔄 Connecting to MongoDB Atlas for Task CRUD & Ownership verification...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to Atlas.');

  const results = [];

  // Helper to register student and get token
  async function createTestStudent(prefix) {
    const email = `${prefix}.${Date.now()}@testuniv.edu`;
    const password = 'TestPassword123!';
    const regRes = await request('POST', '/api/auth/register', {
      name: `${prefix} Student`,
      email,
      password,
      department: 'Computer Science',
    });
    return {
      userId: regRes.body.user._id,
      email,
      token: regRes.body.token,
    };
  }

  const studentA = await createTestStudent('studentA');
  const studentB = await createTestStudent('studentB');
  console.log(`Created disposable Student A (${studentA.email}) & Student B (${studentB.email})`);

  let taskAId = null;

  try {
    // 1. GET /api/tasks without token -> 401
    const resNoToken = await request('GET', '/api/tasks');
    results.push({
      test: '1. GET /api/tasks without token returns 401',
      expected: 401,
      actual: resNoToken.status,
      passed: resNoToken.status === 401,
    });

    // 2. POST /api/tasks with missing title -> 400
    const resMissingTitle = await request(
      'POST',
      '/api/tasks',
      { subject: 'Math', priority: 'High' },
      { authorization: `Bearer ${studentA.token}` }
    );
    results.push({
      test: '2. POST /api/tasks with missing title returns 400',
      expected: 400,
      actual: resMissingTitle.status,
      passed: resMissingTitle.status === 400,
    });

    // 3. POST /api/tasks with missing subject -> 400
    const resMissingSubject = await request(
      'POST',
      '/api/tasks',
      { title: 'Homework 1' },
      { authorization: `Bearer ${studentA.token}` }
    );
    results.push({
      test: '3. POST /api/tasks with missing subject returns 400',
      expected: 400,
      actual: resMissingSubject.status,
      passed: resMissingSubject.status === 400,
    });

    // 4. POST /api/tasks valid creation -> 201
    const resCreate = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Complete Data Structures Lab',
        description: 'Implement binary search tree operations in JavaScript',
        subject: 'Data Structures',
        priority: 'High',
        status: 'Pending',
        dueDate: '2026-11-01T00:00:00.000Z',
      },
      { authorization: `Bearer ${studentA.token}` }
    );
    taskAId = resCreate.body?.data?._id;
    results.push({
      test: '4. POST /api/tasks valid creation returns 201',
      expected: 201,
      actual: resCreate.status,
      passed:
        resCreate.status === 201 &&
        resCreate.body?.data?.title === 'Complete Data Structures Lab' &&
        resCreate.body?.data?.user.toString() === studentA.userId.toString(),
    });

    // 5. GET /api/tasks for Student A -> 200 with 1 task
    const resGetTasksA = await request('GET', '/api/tasks', null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: "5. GET /api/tasks returns Student A's task list (count 1)",
      expected: 200,
      actual: resGetTasksA.status,
      passed: resGetTasksA.status === 200 && resGetTasksA.body?.count === 1,
    });

    // 6. GET /api/tasks with status filter (?status=Pending)
    const resFilterPending = await request('GET', '/api/tasks?status=Pending', null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: '6. GET /api/tasks?status=Pending filters correctly',
      expected: 200,
      actual: resFilterPending.status,
      passed: resFilterPending.status === 200 && resFilterPending.body?.count === 1,
    });

    // 7. GET /api/tasks with status filter (?status=Completed) -> should return 0 tasks
    const resFilterCompleted = await request('GET', '/api/tasks?status=Completed', null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: '7. GET /api/tasks?status=Completed returns empty array (count 0)',
      expected: 0,
      actual: resFilterCompleted.body?.count,
      passed: resFilterCompleted.status === 200 && resFilterCompleted.body?.count === 0,
    });

    // 8. GET /api/tasks/:id for Student A (owner) -> 200
    const resGetOne = await request('GET', `/api/tasks/${taskAId}`, null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: '8. GET /api/tasks/:id returns task for owner',
      expected: 200,
      actual: resGetOne.status,
      passed: resGetOne.status === 200 && resGetOne.body?.data?._id === taskAId,
    });

    // 9. GET /api/tasks/invalid-id-format -> 400
    const resInvalidId = await request('GET', '/api/tasks/invalid123', null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: '9. GET /api/tasks/invalid-id returns 400 Bad Request',
      expected: 400,
      actual: resInvalidId.status,
      passed: resInvalidId.status === 400,
    });

    // 10. GET /api/tasks/:id for non-existent ID -> 404
    const fakeId = new mongoose.Types.ObjectId();
    const resNonExistent = await request('GET', `/api/tasks/${fakeId}`, null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: '10. GET /api/tasks/:id with non-existent ID returns 404',
      expected: 404,
      actual: resNonExistent.status,
      passed: resNonExistent.status === 404,
    });

    // 11. PUT /api/tasks/:id update task title & priority -> 200
    const resUpdate = await request(
      'PUT',
      `/api/tasks/${taskAId}`,
      {
        title: 'Complete Data Structures Lab (Updated)',
        priority: 'Medium',
      },
      { authorization: `Bearer ${studentA.token}` }
    );
    results.push({
      test: '11. PUT /api/tasks/:id updates title & priority',
      expected: 200,
      actual: resUpdate.status,
      passed:
        resUpdate.status === 200 &&
        resUpdate.body?.data?.title === 'Complete Data Structures Lab (Updated)' &&
        resUpdate.body?.data?.priority === 'Medium',
    });

    // 12. PATCH /api/tasks/:id/status toggle to Completed -> 200
    const resPatchStatus = await request(
      'PATCH',
      `/api/tasks/${taskAId}/status`,
      { status: 'Completed' },
      { authorization: `Bearer ${studentA.token}` }
    );
    results.push({
      test: '12. PATCH /api/tasks/:id/status updates status to Completed',
      expected: 200,
      actual: resPatchStatus.status,
      passed: resPatchStatus.status === 200 && resPatchStatus.body?.data?.status === 'Completed',
    });

    // 13. PATCH /api/tasks/:id/status with invalid status value -> 400
    const resBadStatus = await request(
      'PATCH',
      `/api/tasks/${taskAId}/status`,
      { status: 'InvalidStatusXYZ' },
      { authorization: `Bearer ${studentA.token}` }
    );
    results.push({
      test: '13. PATCH /api/tasks/:id/status with bad status returns 400',
      expected: 400,
      actual: resBadStatus.status,
      passed: resBadStatus.status === 400,
    });

    // ========================================================
    // OWNERSHIP ENFORCEMENT TESTS (Student B vs Student A's task)
    // ========================================================

    // 14. Student B tries to list tasks -> should NOT see Student A's task
    const resGetTasksB = await request('GET', '/api/tasks', null, {
      authorization: `Bearer ${studentB.token}`,
    });
    results.push({
      test: "14. [Ownership] Student B cannot see Student A's tasks in list (count 0)",
      expected: 0,
      actual: resGetTasksB.body?.count,
      passed: resGetTasksB.status === 200 && resGetTasksB.body?.count === 0,
    });

    // 15. Student B tries to GET Student A's task by ID -> 403 Forbidden
    const resBGetA = await request('GET', `/api/tasks/${taskAId}`, null, {
      authorization: `Bearer ${studentB.token}`,
    });
    results.push({
      test: "15. [Ownership] Student B GET Student A's task returns 403 Forbidden",
      expected: 403,
      actual: resBGetA.status,
      passed: resBGetA.status === 403,
    });

    // 16. Student B tries to PUT Student A's task -> 403 Forbidden
    const resBPutA = await request(
      'PUT',
      `/api/tasks/${taskAId}`,
      { title: 'Hacked by Student B' },
      { authorization: `Bearer ${studentB.token}` }
    );
    results.push({
      test: "16. [Ownership] Student B PUT Student A's task returns 403 Forbidden",
      expected: 403,
      actual: resBPutA.status,
      passed: resBPutA.status === 403,
    });

    // 17. Student B tries to PATCH status of Student A's task -> 403 Forbidden
    const resBPatchA = await request(
      'PATCH',
      `/api/tasks/${taskAId}/status`,
      { status: 'Pending' },
      { authorization: `Bearer ${studentB.token}` }
    );
    results.push({
      test: "17. [Ownership] Student B PATCH Student A's task returns 403 Forbidden",
      expected: 403,
      actual: resBPatchA.status,
      passed: resBPatchA.status === 403,
    });

    // 18. Student B tries to DELETE Student A's task -> 403 Forbidden
    const resBDeleteA = await request('DELETE', `/api/tasks/${taskAId}`, null, {
      authorization: `Bearer ${studentB.token}`,
    });
    results.push({
      test: "18. [Ownership] Student B DELETE Student A's task returns 403 Forbidden",
      expected: 403,
      actual: resBDeleteA.status,
      passed: resBDeleteA.status === 403,
    });

    // 19. Student A (owner) deletes the task -> 200
    const resADelete = await request('DELETE', `/api/tasks/${taskAId}`, null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: '19. Student A (owner) DELETE task returns 200',
      expected: 200,
      actual: resADelete.status,
      passed: resADelete.status === 200,
    });

    // 20. GET deleted task -> 404
    const resGetDeleted = await request('GET', `/api/tasks/${taskAId}`, null, {
      authorization: `Bearer ${studentA.token}`,
    });
    results.push({
      test: '20. GET task after deletion returns 404 Not Found',
      expected: 404,
      actual: resGetDeleted.status,
      passed: resGetDeleted.status === 404,
    });

  } finally {
    // Cleanup disposable test data from MongoDB Atlas
    console.log('\n🧹 Cleaning up test tasks and disposable test students from Atlas...');
    await Task.deleteMany({ user: { $in: [studentA.userId, studentB.userId] } });
    await User.deleteMany({ _id: { $in: [studentA.userId, studentB.userId] } });
    console.log('✅ Atlas database cleaned.');
  }

  console.log('\n=======================================');
  console.log('TASK CRUD & OWNERSHIP TEST SUMMARY:');
  console.log('=======================================');
  console.table(results);

  await mongoose.disconnect();
  const allPassed = results.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runTaskTests().catch((err) => {
  console.error('Fatal Task Test Runner Error:', err);
  process.exit(1);
});
