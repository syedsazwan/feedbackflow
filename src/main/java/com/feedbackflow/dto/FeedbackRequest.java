package com.feedbackflow.dto;

import java.util.List;

public class FeedbackRequest {

    private Long courseId;
    private List<RatingRequest> ratings;

    // Default constructor
    public FeedbackRequest() {
    }

    // Parameterized constructor
    public FeedbackRequest(Long courseId, List<RatingRequest> ratings) {
        this.courseId = courseId;
        this.ratings = ratings;
    }

    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public List<RatingRequest> getRatings() {
        return ratings;
    }

    public void setRatings(List<RatingRequest> ratings) {
        this.ratings = ratings;
    }
}
