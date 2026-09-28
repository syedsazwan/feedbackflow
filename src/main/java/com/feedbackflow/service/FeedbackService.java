package com.feedbackflow.service;

import com.feedbackflow.dto.FeedbackRequest;
import com.feedbackflow.dto.QuestionAverageResponse;
import com.feedbackflow.dto.RatingRequest;
import com.feedbackflow.model.Course;
import com.feedbackflow.model.Feedback;
import com.feedbackflow.model.FeedbackResponse;
import com.feedbackflow.model.Question;
import com.feedbackflow.model.Semester;
import com.feedbackflow.model.Student;
import com.feedbackflow.repository.CourseRepository;
import com.feedbackflow.repository.FeedbackRepository;
import com.feedbackflow.repository.FeedbackResponseRepository;
import com.feedbackflow.repository.QuestionRepository;
import com.feedbackflow.repository.SemesterRepository;
import com.feedbackflow.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;

    // Constructor injection
    public FeedbackService(FeedbackRepository feedbackRepository,
                           FeedbackResponseRepository feedbackResponseRepository,
                           CourseRepository courseRepository,
                           QuestionRepository questionRepository,
                           StudentRepository studentRepository,
                           SemesterRepository semesterRepository) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackResponseRepository = feedbackResponseRepository;
        this.courseRepository = courseRepository;
        this.questionRepository = questionRepository;
        this.studentRepository = studentRepository;
        this.semesterRepository = semesterRepository;
    }

    // Submit feedback for a course
    @Transactional
    public Feedback submitFeedback(FeedbackRequest request) {
        // Validate ratings list
        if (request == null || request.getRatings() == null || request.getRatings().isEmpty()) {
            throw new RuntimeException("At least one rating is required");
        }

        // STEP 1: Find Student
        if (request.getStudentId() == null) {
            throw new RuntimeException("Student not found");
        }
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // STEP 2: Find Course
        if (request.getCourseId() == null) {
            throw new RuntimeException("Course not found");
        }
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // STEP 3: Find Semester
        if (request.getSemesterId() == null) {
            throw new RuntimeException("Semester not found");
        }
        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        // STEP 4: Check semester is open
        if (!semester.isFeedbackOpen()) {
            throw new RuntimeException("Feedback submission is closed for this semester");
        }

        // STEP 5: Check deadline
        if (semester.getFeedbackDeadline() != null && LocalDate.now().isAfter(semester.getFeedbackDeadline())) {
            throw new RuntimeException("Feedback deadline has passed");
        }

        // STEP 6: Check duplicate feedback before saving
        boolean alreadySubmitted = feedbackRepository.existsByStudentIdAndCourseIdAndSemesterId(
                student.getId(),
                course.getId(),
                semester.getId()
        );
        if (alreadySubmitted) {
            throw new RuntimeException("Feedback already submitted for this course in this semester");
        }

        // STEP 7: Create and save Feedback
        Feedback feedback = new Feedback();
        feedback.setStudent(student);
        feedback.setCourse(course);
        feedback.setSemester(semester);
        feedback.setSubmittedAt(LocalDateTime.now());
        Feedback savedFeedback = feedbackRepository.save(feedback);

        // STEP 8: Preserve existing rating logic & validate ratings
        for (RatingRequest ratingRequest : request.getRatings()) {
            if (ratingRequest.getRating() == null || ratingRequest.getRating() < 1 || ratingRequest.getRating() > 5) {
                throw new RuntimeException("Rating must be between 1 and 5");
            }

            Question question = questionRepository.findById(ratingRequest.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            FeedbackResponse feedbackResponse = new FeedbackResponse();
            feedbackResponse.setFeedback(savedFeedback);
            feedbackResponse.setQuestion(question);
            feedbackResponse.setRating(ratingRequest.getRating());

            feedbackResponseRepository.save(feedbackResponse);
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
