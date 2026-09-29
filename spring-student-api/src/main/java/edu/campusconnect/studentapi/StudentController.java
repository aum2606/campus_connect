package edu.campusconnect.studentapi;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/students")
public class StudentController {
  private final StudentService service;

  public StudentController(StudentService service) { this.service = service; }

  @GetMapping
  public List<Student> listStudents() { return service.listStudents(); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Student createStudent(@Valid @RequestBody StudentRequest request) { return service.createStudent(request); }
}
