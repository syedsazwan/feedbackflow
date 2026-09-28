package com.feedbackflow.service;

import com.feedbackflow.dto.FeedbackRequest;
import com.feedbackflow.dto.QuestionAverageResponse;
import com.feedbackflow.dto.RatingRequest;
import com.feedbackflow.model.Course;
import com.feedbackflow.model.Feedback;
import com.feedbackflow.model.FeedbackResponse;
import com.feedbackflow.model.Question;
import com.feedbackflow.repository.CourseRepository;
import com.feedbackflow.repository.FeedbackRepository;
import com.feedbackflow.repository.FeedbackResponseRepository;
import com.feedbackflow.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackResponseRepository feedbackResponseRepository;
    private final CourseRepository courseRepository;
    private final QuestionRepository questionRepository;

    // Constructor injection
    public FeedbackService(FeedbackRepository feedbackRepository,
                           FeedbackResponseRepository feedbackResponseRepository,
                           CourseRepository courseRepository,
                           QuestionRepository questionRepository) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackResponseRepository = feedbackResponseRepository;
        this.courseRepository = courseRepository;
        this.questionRepository = questionRepository;
    }

    // Submit feedback for a course
    @Transactional
    public Feedback submitFeedback(FeedbackRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Feedback feedback = new Feedback();
        feedback.setCourse(course);
        feedback.setSubmittedAt(LocalDateTime.now());
        Feedback savedFeedback = feedbackRepository.save(feedback);

        if (request.getRatings() != null) {
            for (RatingRequest ratingRequest : request.getRatings()) {
                Question question = questionRepository.findById(ratingRequest.getQuestionId())
                        .orElseThrow(() -> new RuntimeException("Question not found"));

                FeedbackResponse feedbackResponse = new FeedbackResponse();
                feedbackResponse.setFeedback(savedFeedback);
                feedbackResponse.setQuestion(question);
                feedbackResponse.setRating(ratingRequest.getRating());

                feedbackResponseRepository.save(feedbackResponse);
            }
        }

        return savedFeedback;
    }

    // Get average rating per question for a course
    public List<QuestionAverageResponse> getCourseQuestionAverages(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found");
        }

        List<FeedbackResponse> responses = feedbackResponseRepository.findByCourseId(courseId);

        // Group responses by question id to calculate average rating per question
        Map<Long, List<FeedbackResponse>> responsesByQuestionId = responses.stream()
                .collect(Collectors.groupingBy(
                        fr -> fr.getQuestion().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<QuestionAverageResponse> averageResponses = new ArrayList<>();
        for (Map.Entry<Long, List<FeedbackResponse>> entry : responsesByQuestionId.entrySet()) {
            List<FeedbackResponse> questionResponses = entry.getValue();
            Question question = questionResponses.get(0).getQuestion();

            double average = questionResponses.stream()
                    .mapToInt(FeedbackResponse::getRating)
                    .average()
                    .orElse(0.0);

            // Round to 2 decimal places
            double roundedAverage = Math.round(average * 100.0) / 100.0;

            averageResponses.add(new QuestionAverageResponse(
                    question.getId(),
                    question.getQuestionText(),
                    roundedAverage
            ));
        }

        return averageResponses;
    }
}
