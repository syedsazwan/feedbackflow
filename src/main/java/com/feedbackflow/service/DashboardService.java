package com.feedbackflow.service;

import com.feedbackflow.dto.DashboardSummaryResponse;
import com.feedbackflow.repository.CourseRepository;
import com.feedbackflow.repository.FeedbackRepository;
import com.feedbackflow.repository.FeedbackResponseRepository;
import com.feedbackflow.repository.QuestionRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final CourseRepository courseRepository;
    private final QuestionRepository questionRepository;
    private final FeedbackRepository feedbackRepository;
    private final FeedbackResponseRepository feedbackResponseRepository;

    // Constructor injection
    public DashboardService(CourseRepository courseRepository,
                            QuestionRepository questionRepository,
                            FeedbackRepository feedbackRepository,
                            FeedbackResponseRepository feedbackResponseRepository) {
        this.courseRepository = courseRepository;
        this.questionRepository = questionRepository;
        this.feedbackRepository = feedbackRepository;
        this.feedbackResponseRepository = feedbackResponseRepository;
    }

    // Get dashboard summary statistics
    public DashboardSummaryResponse getDashboardSummary() {
        long totalCourses = courseRepository.count();
        long totalQuestions = questionRepository.count();
        long totalFeedback = feedbackRepository.count();

        Double avg = feedbackResponseRepository.getOverallAverageRating();
        double overallAverageRating = (avg != null) ? Math.round(avg * 100.0) / 100.0 : 0.0;

        return new DashboardSummaryResponse(
                totalCourses,
                totalQuestions,
                totalFeedback,
                overallAverageRating
        );
    }
}
