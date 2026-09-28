package com.feedbackflow.dto;

import java.time.LocalDate;

public class SemesterStatusResponse {

    private Long semesterId;
    private String semesterName;
    private boolean feedbackOpen;
    private LocalDate feedbackDeadline;
    private boolean submissionAllowed;

    // Default constructor
    public SemesterStatusResponse() {
    }

    // Parameterized constructor
    public SemesterStatusResponse(Long semesterId, String semesterName, boolean feedbackOpen,
                                  LocalDate feedbackDeadline, boolean submissionAllowed) {
        this.semesterId = semesterId;
        this.semesterName = semesterName;
        this.feedbackOpen = feedbackOpen;
        this.feedbackDeadline = feedbackDeadline;
        this.submissionAllowed = submissionAllowed;
    }

    // Getters and Setters
    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public boolean isFeedbackOpen() {
        return feedbackOpen;
    }

    public void setFeedbackOpen(boolean feedbackOpen) {
        this.feedbackOpen = feedbackOpen;
    }

    public LocalDate getFeedbackDeadline() {
        return feedbackDeadline;
    }

    public void setFeedbackDeadline(LocalDate feedbackDeadline) {
        this.feedbackDeadline = feedbackDeadline;
    }

    public boolean isSubmissionAllowed() {
        return submissionAllowed;
    }

    public void setSubmissionAllowed(boolean submissionAllowed) {
        this.submissionAllowed = submissionAllowed;
    }
}
