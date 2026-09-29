import { useEffect, useState } from 'react';
import { studentsApi } from './api';
import StudentForm from './StudentForm';
import StudentList from './StudentList';

export default function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function loadStudents() {
    setLoading(true);
    try { setStudents(await studentsApi.list()); setError(''); }
    catch (requestError) { setError('Unable to load data. Please try again.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadStudents(); }, []);
  async function saveStudent(student) {
    try { if (selectedStudent) await studentsApi.update(selectedStudent.id, student); else await studentsApi.create(student); setSelectedStudent(null); await loadStudents(); }
    catch (requestError) { setError(requestError.message); }
  }
  async function deleteStudent(id) {
    try { await studentsApi.remove(id); await loadStudents(); }
    catch (requestError) { setError(requestError.message); }
  }
  return <main><h1>CampusConnect Students</h1>{error && <p className="error">{error}</p>}<StudentForm selectedStudent={selectedStudent} onSave={saveStudent} onCancel={() => setSelectedStudent(null)} />{loading ? <p>Loading students...</p> : <StudentList students={students} onEdit={setSelectedStudent} onDelete={deleteStudent} />}</main>;
}
