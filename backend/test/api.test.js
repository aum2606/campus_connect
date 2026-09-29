const test = require('node:test');
const assert = require('node:assert/strict');
const { app, resetStudents } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());
test.beforeEach(() => resetStudents());

test('Student CRUD returns the expected status codes', async () => {
  const list = await fetch(`${baseUrl}/students`);
  assert.equal(list.status, 200);
  assert.equal((await list.json()).length, 1);

  const create = await fetch(`${baseUrl}/students`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Maya Shah', email: 'maya@example.com', course: 'Information Technology', semester: 4 }),
  });
  assert.equal(create.status, 201);
  const student = await create.json();

  const update = await fetch(`${baseUrl}/students/${student.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...student, semester: 5 }),
  });
  assert.equal(update.status, 200);

  const remove = await fetch(`${baseUrl}/students/${student.id}`, { method: 'DELETE' });
  assert.equal(remove.status, 204);
  assert.equal((await fetch(`${baseUrl}/students/${student.id}`)).status, 404);
});

test('invalid student input returns a structured 400 error', async () => {
  const response = await fetch(`${baseUrl}/students`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'not-an-email', course: '', semester: -2 }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, 'Validation failed.');
  assert.ok(body.details.email);
});
