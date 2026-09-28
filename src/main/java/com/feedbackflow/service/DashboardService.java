package com.feedbackflow.service;

import com.feedbackflow.dto.DashboardSummaryResponse;
import com.feedbackflow.repository.CourseRepository;
import com.feedbackflow.repository.FeedbackRepository;
import com.feedbackflow.repository.FeedbackResponseRepository;
import com.feedbackflow.repository.QuestionRepository;
import com.feedbackflow.repository.SemesterRepository;
import com.feedbackflow.repository.StudentRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final CourseRepository courseRepository;
    private final QuestionRepository questionRepository;
    private final FeedbackRepository feedbackRepository;
    private final FeedbackResponseRepository feedbackResponseRepository;
    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;

    // Constructor injection
    public DashboardService(CourseRepository courseRepository,
                            QuestionRepository questionRepository,
                            FeedbackRepository feedbackRepository,
                            FeedbackResponseRepository feedbackResponseRepository,
                            StudentRepository studentRepository,
                            SemesterRepository semesterRepository) {
        this.courseRepository = courseRepository;
        this.questionRepository = questionRepository;
        this.feedbackRepository = feedbackRepository;
        this.feedbackResponseRepository = feedbackResponseRepository;
        this.studentRepository = studentRepository;
        this.semesterRepository = semesterRepository;
    }

    // Get dashboard summary statistics
    public DashboardSummaryResponse getDashboardSummary() {
        long totalCourses = courseRepository.count();
        long totalQuestions = questionRepository.count();
        long totalFeedback = feedbackRepository.count();

        Double avg = feedbackResponseRepository.getOverallAverageRating();
        double overallAverageRating = (avg != null) ? Math.round(avg * 100.0) / 100.0 : 0.0;

        long totalStudents = studentRepository.count();
        long totalSemesters = semesterRepository.count();
        long openSemesters = semesterRepository.countByFeedbackOpenTrue();

        return new DashboardSummaryResponse(
                totalCourses,
                totalQuestions,
                totalFeedback,
                overallAverageRating,
                totalStudents,
                totalSemesters,
                openSemesters
        );
    }
}
