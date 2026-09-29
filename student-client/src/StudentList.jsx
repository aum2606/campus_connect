export default function StudentList({ students, onEdit, onDelete }) {
  return <section><h2>Students</h2><table><thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Semester</th><th>Actions</th></tr></thead>
    <tbody>{students.map((student) => <tr key={student.id}><td>{student.name}</td><td>{student.email}</td><td>{student.course}</td><td>{student.semester}</td><td><button onClick={() => onEdit(student)}>Edit</button><button onClick={() => onDelete(student.id)}>Delete</button></td></tr>)}</tbody>
  </table></section>;
}
