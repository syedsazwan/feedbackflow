package com.feedbackflow.controller;

import com.feedbackflow.dto.FeedbackRequest;
import com.feedbackflow.dto.QuestionAverageResponse;
import com.feedbackflow.model.Feedback;
import com.feedbackflow.service.FeedbackService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    // Constructor injection
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Submit feedback for a course
    @PostMapping
    public Feedback submitFeedback(@RequestBody FeedbackRequest request) {
        return feedbackService.submitFeedback(request);
    }

    // Get average rating per question for a specific course
    @GetMapping("/course/{courseId}/averages")
    public List<QuestionAverageResponse> getCourseQuestionAverages(@PathVariable Long courseId) {
        return feedbackService.getCourseQuestionAverages(courseId);
    }
}
