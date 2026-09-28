package com.feedbackflow.service;

import com.feedbackflow.model.Student;
import com.feedbackflow.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    // Constructor injection
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get student by ID
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // Create a new student
    public Student createStudent(Student student) {
        if (student == null) {
            throw new RuntimeException("Student details are required");
        }

        if (student.getRegisterNumber() == null || student.getRegisterNumber().trim().isEmpty()) {
            throw new RuntimeException("Register number is required");
        }

        if (student.getStudentName() == null || student.getStudentName().trim().isEmpty()) {
            throw new RuntimeException("Student name is required");
        }

        String registerNumber = student.getRegisterNumber().trim();
        if (studentRepository.existsByRegisterNumber(registerNumber)) {
            throw new RuntimeException("Register number already exists");
        }

        student.setRegisterNumber(registerNumber);
        student.setStudentName(student.getStudentName().trim());
        return studentRepository.save(student);
    }

    // Update an existing student
    public Student updateStudent(Long id, Student student) {
        Student existing = getStudentById(id);

        if (student == null) {
            throw new RuntimeException("Student details are required");
        }

        if (student.getRegisterNumber() == null || student.getRegisterNumber().trim().isEmpty()) {
            throw new RuntimeException("Register number is required");
        }

        if (student.getStudentName() == null || student.getStudentName().trim().isEmpty()) {
            throw new RuntimeException("Student name is required");
        }

        String updatedRegisterNumber = student.getRegisterNumber().trim();

        // Prevent duplicate register number belonging to another student
        if (!updatedRegisterNumber.equalsIgnoreCase(existing.getRegisterNumber()) &&
                studentRepository.existsByRegisterNumber(updatedRegisterNumber)) {
            throw new RuntimeException("Register number already exists");
        }

        existing.setRegisterNumber(updatedRegisterNumber);
        existing.setStudentName(student.getStudentName().trim());
        return studentRepository.save(existing);
    }

    // Delete a student by ID
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }
        studentRepository.deleteById(id);
    }
}
