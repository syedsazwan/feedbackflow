package com.feedbackflow.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

@Entity
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Semester name is required")
    @Column(name = "semester_name")
    private String semesterName;

    @Column(name = "feedback_deadline")
    private LocalDate feedbackDeadline;

    @Column(name = "feedback_open")
    private boolean feedbackOpen;

    // Default constructor
    public Semester() {
    }

    // Parameterized constructor
    public Semester(String semesterName, LocalDate feedbackDeadline, boolean feedbackOpen) {
        this.semesterName = semesterName;
        this.feedbackDeadline = feedbackDeadline;
        this.feedbackOpen = feedbackOpen;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public LocalDate getFeedbackDeadline() {
        return feedbackDeadline;
    }

    public void setFeedbackDeadline(LocalDate feedbackDeadline) {
        this.feedbackDeadline = feedbackDeadline;
    }

    public boolean isFeedbackOpen() {
        return feedbackOpen;
    }

    public void setFeedbackOpen(boolean feedbackOpen) {
        this.feedbackOpen = feedbackOpen;
    }
}
