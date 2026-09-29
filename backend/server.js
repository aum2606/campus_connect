require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const Student = require('./models/Student');

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGO_URI;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
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

function validateRequest(req, res) {
  const errors = validateStudent(req.body || {});
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Validation failed.', details: errors });
    return false;
  }
  return true;
}

function normaliseStudent(body) {
  return { name: body.name.trim(), email: body.email.trim().toLowerCase(), course: body.course.trim(), semester: body.semester };
}

async function findStudent(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Student.findById(id);
}

app.get('/students', async (req, res, next) => {
  try { res.status(200).json(await Student.find()); } catch (error) { next(error); }
});

app.get('/students/:id', async (req, res, next) => {
  try {
    const student = await findStudent(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    return res.status(200).json(student);
  } catch (error) { return next(error); }
});

app.post('/students', async (req, res, next) => {
  if (!validateRequest(req, res)) return;
  try { return res.status(201).json(await Student.create(normaliseStudent(req.body))); } catch (error) { return next(error); }
});

app.put('/students/:id', async (req, res, next) => {
  if (!validateRequest(req, res)) return;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Student not found.' });
    const student = await Student.findByIdAndUpdate(req.params.id, normaliseStudent(req.body), { new: true, runValidators: true });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    return res.status(200).json(student);
  } catch (error) { return next(error); }
});

app.delete('/students/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Student not found.' });
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    return res.status(204).send();
  } catch (error) { return next(error); }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Invalid JSON request body.' });
  if (error.code === 11000) return res.status(400).json({ error: 'Validation failed.', details: { email: 'Email must be unique.' } });
  if (error.name === 'ValidationError') return res.status(400).json({ error: 'Validation failed.', details: error.errors });
  console.error(error);
  return res.status(500).json({ error: 'Internal server error.' });
});

async function connectDatabase() {
  if (!mongoUri) throw new Error('MONGO_URI is required. Copy .env.example to .env and add your MongoDB Atlas URI.');
  await mongoose.connect(mongoUri);
}

if (require.main === module) {
  connectDatabase()
    .then(() => app.listen(port, () => console.log(`Student API running at http://localhost:${port}`)))
    .catch((error) => { console.error(error.message); process.exit(1); });
}

module.exports = { app, connectDatabase, validateStudent };
