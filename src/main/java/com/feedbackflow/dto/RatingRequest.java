package com.feedbackflow.dto;

public class RatingRequest {

    private Long questionId;
    private Integer rating;

    // Default constructor
    public RatingRequest() {
    }

    // Parameterized constructor
    public RatingRequest(Long questionId, Integer rating) {
        this.questionId = questionId;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}
