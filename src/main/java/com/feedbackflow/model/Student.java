package com.feedbackflow.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Register number is required")
    @Column(name = "register_number", unique = true, nullable = false)
    private String registerNumber;

    @NotBlank(message = "Student name is required")
    @Column(name = "student_name")
    private String studentName;

    // Default constructor
    public Student() {
    }

    // Parameterized constructor
    public Student(String registerNumber, String studentName) {
        this.registerNumber = registerNumber;
        this.studentName = studentName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
}
