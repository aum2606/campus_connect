const test = require('node:test');
const assert = require('node:assert/strict');
const { validateStudent } = require('../server');

test('valid Student input passes validation', () => {
  assert.deepEqual(validateStudent({ name: 'Maya Shah', email: 'maya@example.com', course: 'IT', semester: 4 }), {});
});

test('invalid Student input returns the required structured fields', () => {
  const errors = validateStudent({ name: '', email: 'invalid-email', course: '', semester: -2 });
  assert.ok(errors.name);
  assert.ok(errors.email);
  assert.ok(errors.course);
  assert.ok(errors.semester);
});
