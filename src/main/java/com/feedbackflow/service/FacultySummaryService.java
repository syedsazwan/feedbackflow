package com.feedbackflow.service;

import com.feedbackflow.dto.CourseFeedbackSummaryResponse;
import com.feedbackflow.model.Course;
import com.feedbackflow.repository.CourseRepository;
import com.feedbackflow.repository.FeedbackRepository;
import com.feedbackflow.repository.FeedbackResponseRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FacultySummaryService {

    private final CourseRepository courseRepository;
    private final FeedbackRepository feedbackRepository;
    private final FeedbackResponseRepository feedbackResponseRepository;

    // Constructor injection
    public FacultySummaryService(CourseRepository courseRepository,
                                 FeedbackRepository feedbackRepository,
                                 FeedbackResponseRepository feedbackResponseRepository) {
        this.courseRepository = courseRepository;
        this.feedbackRepository = feedbackRepository;
        this.feedbackResponseRepository = feedbackResponseRepository;
    }

    // Get feedback summary for all courses
    public List<CourseFeedbackSummaryResponse> getCourseFeedbackSummary() {
        List<Course> courses = courseRepository.findAll();
        List<CourseFeedbackSummaryResponse> summaries = new ArrayList<>();

        for (Course course : courses) {
            summaries.add(buildSummaryForCourse(course));
        }

        return summaries;
    }

    // Get feedback summary for a single course by ID
    public CourseFeedbackSummaryResponse getCourseFeedbackSummaryById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return buildSummaryForCourse(course);
    }

    // Helper method to build course feedback summary response
    private CourseFeedbackSummaryResponse buildSummaryForCourse(Course course) {
        long totalFeedback = feedbackRepository.countByCourseId(course.getId());
        double averageRating = 0.0;

        if (totalFeedback > 0) {
            Double avg = feedbackResponseRepository.getAverageRatingByCourseId(course.getId());
            if (avg != null) {
                // Round to 1 decimal place
                averageRating = Math.round(avg * 10.0) / 10.0;
            }
        }

        return new CourseFeedbackSummaryResponse(
                course.getId(),
                course.getCourseCode(),
                course.getCourseName(),
                course.getDepartment(),
                totalFeedback,
                averageRating
        );
    }
}
