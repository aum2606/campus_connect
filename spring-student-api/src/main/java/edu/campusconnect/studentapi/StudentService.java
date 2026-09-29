package edu.campusconnect.studentapi;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
  private final StudentRepository repository;

  public StudentService(StudentRepository repository) { this.repository = repository; }
  public List<Student> listStudents() { return repository.findAll(); }
  public Student createStudent(StudentRequest request) { return repository.save(request); }
}
