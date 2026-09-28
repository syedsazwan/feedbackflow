package com.feedbackflow.dto;

public class DashboardSummaryResponse {

    private long totalCourses;
    private long totalQuestions;
    private long totalFeedback;
    private double overallAverageRating;
    private long totalStudents;
    private long totalSemesters;
    private long openSemesters;

    // Default constructor
    public DashboardSummaryResponse() {
    }

    // Parameterized constructor (original 4-parameter for backwards compatibility)
    public DashboardSummaryResponse(long totalCourses, long totalQuestions, long totalFeedback, double overallAverageRating) {
        this.totalCourses = totalCourses;
        this.totalQuestions = totalQuestions;
        this.totalFeedback = totalFeedback;
        this.overallAverageRating = overallAverageRating;
    }

    // Parameterized constructor (extended with student and semester metrics)
    public DashboardSummaryResponse(long totalCourses, long totalQuestions, long totalFeedback, double overallAverageRating,
                                    long totalStudents, long totalSemesters, long openSemesters) {
        this.totalCourses = totalCourses;
        this.totalQuestions = totalQuestions;
        this.totalFeedback = totalFeedback;
        this.overallAverageRating = overallAverageRating;
        this.totalStudents = totalStudents;
        this.totalSemesters = totalSemesters;
        this.openSemesters = openSemesters;
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

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalSemesters() {
        return totalSemesters;
    }

    public void setTotalSemesters(long totalSemesters) {
        this.totalSemesters = totalSemesters;
    }

    public long getOpenSemesters() {
        return openSemesters;
    }

    public void setOpenSemesters(long openSemesters) {
        this.openSemesters = openSemesters;
    }
}
