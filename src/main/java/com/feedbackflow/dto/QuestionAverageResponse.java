package com.feedbackflow.dto;

public class QuestionAverageResponse {

    private Long questionId;
    private String questionText;
    private Double averageRating;

    // Default constructor
    public QuestionAverageResponse() {
    }

    // Parameterized constructor
    public QuestionAverageResponse(Long questionId, String questionText, Double averageRating) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.averageRating = averageRating;
    }

    // Getters and Setters
    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
}
