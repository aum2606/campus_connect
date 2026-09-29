package edu.campusconnect.studentapi;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;

@Repository
public class StudentRepository {
  private final List<Student> students = new ArrayList<>(List.of(
      new Student(1, "Aarav Patel", "aarav@example.com", "Computer Science", 5)));
  private final AtomicLong nextId = new AtomicLong(2);

  public List<Student> findAll() { return List.copyOf(students); }

  public Student save(StudentRequest request) {
    Student student = new Student(nextId.getAndIncrement(), request.name(), request.email(), request.course(), request.semester());
    students.add(student);
    return student;
  }
}
