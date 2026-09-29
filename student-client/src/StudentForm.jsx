import { useEffect, useState } from 'react';

const emptyStudent = { name: '', email: '', course: '', semester: '' };

export default function StudentForm({ selectedStudent, onSave, onCancel }) {
  const [student, setStudent] = useState(emptyStudent);
  const [error, setError] = useState('');
  useEffect(() => setStudent(selectedStudent ? { ...selectedStudent } : emptyStudent), [selectedStudent]);
  function submit(event) {
    event.preventDefault();
    if (!student.name.trim() || !/^\S+@\S+\.\S+$/.test(student.email) || !student.course.trim() || Number(student.semester) < 1) {
      setError('Enter a name, valid email, course, and positive semester.');
      return;
    }
    setError('');
    onSave({ ...student, semester: Number(student.semester) });
  }
  return <form onSubmit={submit}>
    <h2>{selectedStudent ? 'Edit student' : 'Add student'}</h2>
    {error && <p className="error">{error}</p>}
    <label>Name<input value={student.name} onChange={(event) => setStudent({ ...student, name: event.target.value })} /></label>
    <label>Email<input type="email" value={student.email} onChange={(event) => setStudent({ ...student, email: event.target.value })} /></label>
    <label>Course<input value={student.course} onChange={(event) => setStudent({ ...student, course: event.target.value })} /></label>
    <label>Semester<input type="number" min="1" value={student.semester} onChange={(event) => setStudent({ ...student, semester: event.target.value })} /></label>
    <div className="actions"><button type="submit">Save</button>{selectedStudent && <button type="button" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}
