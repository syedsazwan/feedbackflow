package com.feedbackflow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class FeedbackRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Semester ID is required")
    private Long semesterId;

    @NotEmpty(message = "At least one rating is required")
    @Valid
    private List<RatingRequest> ratings;

    // Default constructor
    public FeedbackRequest() {
    }

    // Parameterized constructor
    public FeedbackRequest(Long studentId, Long courseId, Long semesterId, List<RatingRequest> ratings) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.semesterId = semesterId;
        this.ratings = ratings;
    }

    // Getters and Setters
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }

    public List<RatingRequest> getRatings() {
        return ratings;
    }

    public void setRatings(List<RatingRequest> ratings) {
        this.ratings = ratings;
    }
}
