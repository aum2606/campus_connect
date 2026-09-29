const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');

const app = express();
const port = Number(process.env.PORT) || 3000;

let students;
let nextId;

function resetStudents() {
  students = [
    { id: 1, name: 'Aarav Patel', email: 'aarav@example.com', course: 'Computer Science', semester: 5 },
  ];
  nextId = 2;
}

resetStudents();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

function validateStudent(body) {
  const errors = {};
  if (typeof body.name !== 'string' || body.name.trim() === '') errors.name = 'Name is required.';
  if (typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email)) errors.email = 'A valid email is required.';
  if (typeof body.course !== 'string' || body.course.trim() === '') errors.course = 'Course is required.';
  if (!Number.isInteger(body.semester) || body.semester < 1) errors.semester = 'Semester must be a positive integer.';
  return errors;
}

function readStudent(req, res) {
  const id = Number(req.params.id);
  const student = students.find((item) => item.id === id);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return null;
  }
  return student;
}

function normaliseStudent(body) {
  return {
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    course: body.course.trim(),
    semester: body.semester,
  };
}

function validateRequest(req, res) {
  const errors = validateStudent(req.body || {});
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Validation failed.', details: errors });
    return false;
  }
  return true;
}

app.get('/students', (req, res) => res.status(200).json(students));

app.get('/students/:id', (req, res) => {
  const student = readStudent(req, res);
  if (student) res.status(200).json(student);
});

app.post('/students', (req, res) => {
  if (!validateRequest(req, res)) return;
  const student = { id: nextId++, ...normaliseStudent(req.body) };
  students.push(student);
  res.status(201).json(student);
});

app.put('/students/:id', (req, res) => {
  const student = readStudent(req, res);
  if (!student || !validateRequest(req, res)) return;
  Object.assign(student, normaliseStudent(req.body));
  res.status(200).json(student);
});

app.delete('/students/:id', (req, res) => {
  const student = readStudent(req, res);
  if (!student) return;
  students = students.filter((item) => item.id !== student.id);
  res.status(204).send();
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(port, () => console.log(`Student API running at http://localhost:${port}`));
}

module.exports = { app, resetStudents };
