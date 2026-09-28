package com.feedbackflow.dto;

public class CourseFeedbackSummaryResponse {

    private Long courseId;
    private String courseCode;
    private String courseName;
    private String department;
    private long totalFeedback;
    private double averageRating;

    // Default constructor
    public CourseFeedbackSummaryResponse() {
    }

    // Parameterized constructor
    public CourseFeedbackSummaryResponse(Long courseId, String courseCode, String courseName,
                                         String department, long totalFeedback, double averageRating) {
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.department = department;
        this.totalFeedback = totalFeedback;
        this.averageRating = averageRating;
    }

    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}
