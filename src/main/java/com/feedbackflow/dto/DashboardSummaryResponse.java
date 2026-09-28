package com.feedbackflow.dto;

public class DashboardSummaryResponse {

    private long totalCourses;
    private long totalQuestions;
    private long totalFeedback;
    private double overallAverageRating;

    // Default constructor
    public DashboardSummaryResponse() {
    }

    // Parameterized constructor
    public DashboardSummaryResponse(long totalCourses, long totalQuestions, long totalFeedback, double overallAverageRating) {
        this.totalCourses = totalCourses;
        this.totalQuestions = totalQuestions;
        this.totalFeedback = totalFeedback;
        this.overallAverageRating = overallAverageRating;
    }

    // Getters and Setters
    public long getTotalCourses() {
        return totalCourses;
    }

    public void setTotalCourses(long totalCourses) {
        this.totalCourses = totalCourses;
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public double getOverallAverageRating() {
        return overallAverageRating;
    }

    public void setOverallAverageRating(double overallAverageRating) {
        this.overallAverageRating = overallAverageRating;
    }
}
