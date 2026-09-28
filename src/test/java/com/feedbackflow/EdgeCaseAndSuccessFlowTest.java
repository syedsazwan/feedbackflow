package com.feedbackflow;

import com.feedbackflow.controller.CourseController;
import com.feedbackflow.controller.DashboardController;
import com.feedbackflow.controller.FacultySummaryController;
import com.feedbackflow.controller.FeedbackController;
import com.feedbackflow.controller.QuestionController;
import com.feedbackflow.controller.SemesterController;
import com.feedbackflow.controller.StudentController;
import com.feedbackflow.dto.CourseFeedbackSummaryResponse;
import com.feedbackflow.dto.DashboardSummaryResponse;
import com.feedbackflow.dto.ErrorResponse;
import com.feedbackflow.dto.FeedbackRequest;
import com.feedbackflow.dto.QuestionAverageResponse;
import com.feedbackflow.dto.RatingRequest;
import com.feedbackflow.exception.GlobalExceptionHandler;
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
import com.feedbackflow.service.CourseService;
import com.feedbackflow.service.DashboardService;
import com.feedbackflow.service.FacultySummaryService;
import com.feedbackflow.service.FeedbackService;
import com.feedbackflow.service.QuestionService;
import com.feedbackflow.service.SemesterService;
import com.feedbackflow.service.StudentService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EdgeCaseAndSuccessFlowTest {

    @Mock
    private CourseRepository courseRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private FeedbackRepository feedbackRepository;
    @Mock
    private FeedbackResponseRepository feedbackResponseRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private SemesterRepository semesterRepository;

    private CourseService courseService;
    private QuestionService questionService;
    private StudentService studentService;
    private SemesterService semesterService;
    private FeedbackService feedbackService;
    private DashboardService dashboardService;
    private FacultySummaryService facultySummaryService;

    private CourseController courseController;
    private QuestionController questionController;
    private StudentController studentController;
    private SemesterController semesterController;
    private FeedbackController feedbackController;
    private DashboardController dashboardController;
    private FacultySummaryController facultySummaryController;

    private GlobalExceptionHandler exceptionHandler;
    private Validator validator;

    @BeforeEach
    void setUp() {
        courseService = new CourseService(courseRepository);
        questionService = new QuestionService(questionRepository);
        studentService = new StudentService(studentRepository);
        semesterService = new SemesterService(semesterRepository);
        feedbackService = new FeedbackService(
                feedbackRepository,
                feedbackResponseRepository,
                courseRepository,
                questionRepository,
                studentRepository,
                semesterRepository
        );
        dashboardService = new DashboardService(
                courseRepository,
                questionRepository,
                feedbackRepository,
                feedbackResponseRepository,
                studentRepository,
                semesterRepository
        );
        facultySummaryService = new FacultySummaryService(
                courseRepository,
                feedbackRepository,
                feedbackResponseRepository
        );

        courseController = new CourseController(courseService);
        questionController = new QuestionController(questionService);
        studentController = new StudentController(studentService);
        semesterController = new SemesterController(semesterService);
        feedbackController = new FeedbackController(feedbackService);
        dashboardController = new DashboardController(dashboardService);
        facultySummaryController = new FacultySummaryController(facultySummaryService);

        exceptionHandler = new GlobalExceptionHandler();

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    // =========================================================================
    // PART 4 — 12 EDGE CASES
    // =========================================================================

    @Nested
    @DisplayName("Part 4 - 12 Edge Case Verification")
    class EdgeCaseTests {

        private Student validStudent;
        private Course validCourse;
        private Semester validSemester;
        private Question validQuestion;

        @BeforeEach
        void initEntities() {
            validStudent = new Student("23AIDS001", "Student One");
            validStudent.setId(1L);

            validCourse = new Course("CS101", "Data Structures", "CSE");
            validCourse.setId(10L);

            validSemester = new Semester("Semester 5 - 2026", LocalDate.now().plusDays(10), true);
            validSemester.setId(100L);

            validQuestion = new Question("Teaching Quality");
            validQuestion.setId(1000L);
        }

        // 1. Duplicate feedback submission -> 409 CONFLICT
        @Test
        @DisplayName("1. Duplicate feedback submission -> 409 CONFLICT")
        void testDuplicateFeedbackSubmission() {
            FeedbackRequest request = new FeedbackRequest(
                    1L, 10L, 100L,
                    List.of(new RatingRequest(1000L, 5))
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(validStudent));
            when(courseRepository.findById(10L)).thenReturn(Optional.of(validCourse));
            when(semesterRepository.findById(100L)).thenReturn(Optional.of(validSemester));
            when(feedbackRepository.existsByStudentIdAndCourseIdAndSemesterId(1L, 10L, 100L)).thenReturn(true);

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Feedback already submitted for this course in this semester", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Feedback already submitted for this course in this semester", response.getBody().getMessage());
        }

        // 2. Closed semester submission -> 400 BAD REQUEST
        @Test
        @DisplayName("2. Closed semester submission -> 400 BAD REQUEST")
        void testClosedSemesterSubmission() {
            validSemester.setFeedbackOpen(false);

            FeedbackRequest request = new FeedbackRequest(
                    1L, 10L, 100L,
                    List.of(new RatingRequest(1000L, 4))
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(validStudent));
            when(courseRepository.findById(10L)).thenReturn(Optional.of(validCourse));
            when(semesterRepository.findById(100L)).thenReturn(Optional.of(validSemester));

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Feedback submission is closed for this semester", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Feedback submission is closed for this semester", response.getBody().getMessage());
        }

        // 3. Expired deadline submission -> 400 BAD REQUEST
        @Test
        @DisplayName("3. Expired deadline submission -> 400 BAD REQUEST")
        void testExpiredDeadlineSubmission() {
            validSemester.setFeedbackDeadline(LocalDate.now().minusDays(1)); // passed deadline

            FeedbackRequest request = new FeedbackRequest(
                    1L, 10L, 100L,
                    List.of(new RatingRequest(1000L, 4))
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(validStudent));
            when(courseRepository.findById(10L)).thenReturn(Optional.of(validCourse));
            when(semesterRepository.findById(100L)).thenReturn(Optional.of(validSemester));

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Feedback deadline has passed", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Feedback deadline has passed", response.getBody().getMessage());
        }

        // 4. Rating below 1 -> 400 BAD REQUEST
        @Test
        @DisplayName("4. Rating below 1 -> 400 BAD REQUEST")
        void testRatingBelowOne() {
            FeedbackRequest request = new FeedbackRequest(
                    1L, 10L, 100L,
                    List.of(new RatingRequest(1000L, 0)) // 0 is invalid
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(validStudent));
            when(courseRepository.findById(10L)).thenReturn(Optional.of(validCourse));
            when(semesterRepository.findById(100L)).thenReturn(Optional.of(validSemester));
            when(feedbackRepository.existsByStudentIdAndCourseIdAndSemesterId(1L, 10L, 100L)).thenReturn(false);
            when(feedbackRepository.save(any(Feedback.class))).thenAnswer(inv -> inv.getArgument(0));

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Rating must be between 1 and 5", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Rating must be between 1 and 5", response.getBody().getMessage());
        }

        // 5. Rating above 5 -> 400 BAD REQUEST
        @Test
        @DisplayName("5. Rating above 5 -> 400 BAD REQUEST")
        void testRatingAboveFive() {
            FeedbackRequest request = new FeedbackRequest(
                    1L, 10L, 100L,
                    List.of(new RatingRequest(1000L, 6)) // 6 is invalid
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(validStudent));
            when(courseRepository.findById(10L)).thenReturn(Optional.of(validCourse));
            when(semesterRepository.findById(100L)).thenReturn(Optional.of(validSemester));
            when(feedbackRepository.existsByStudentIdAndCourseIdAndSemesterId(1L, 10L, 100L)).thenReturn(false);
            when(feedbackRepository.save(any(Feedback.class))).thenAnswer(inv -> inv.getArgument(0));

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Rating must be between 1 and 5", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Rating must be between 1 and 5", response.getBody().getMessage());
        }

        // 6. Empty ratings -> 400 BAD REQUEST
        @Test
        @DisplayName("6. Empty ratings -> 400 BAD REQUEST")
        void testEmptyRatings() {
            FeedbackRequest request = new FeedbackRequest(1L, 10L, 100L, Collections.emptyList());

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("At least one rating is required", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("At least one rating is required", response.getBody().getMessage());
        }

        // 7. Invalid student ID -> 404 NOT FOUND
        @Test
        @DisplayName("7. Invalid student ID -> 404 NOT FOUND")
        void testInvalidStudentId() {
            FeedbackRequest request = new FeedbackRequest(
                    999L, 10L, 100L,
                    List.of(new RatingRequest(1000L, 5))
            );

            when(studentRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Student not found", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Student not found", response.getBody().getMessage());
        }

        // 8. Invalid semester ID -> 404 NOT FOUND
        @Test
        @DisplayName("8. Invalid semester ID -> 404 NOT FOUND")
        void testInvalidSemesterId() {
            FeedbackRequest request = new FeedbackRequest(
                    1L, 10L, 999L,
                    List.of(new RatingRequest(1000L, 5))
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(validStudent));
            when(courseRepository.findById(10L)).thenReturn(Optional.of(validCourse));
            when(semesterRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Semester not found", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Semester not found", response.getBody().getMessage());
        }

        // 9. Invalid course ID -> 404 NOT FOUND
        @Test
        @DisplayName("9. Invalid course ID -> 404 NOT FOUND")
        void testInvalidCourseId() {
            FeedbackRequest request = new FeedbackRequest(
                    1L, 999L, 100L,
                    List.of(new RatingRequest(1000L, 5))
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(validStudent));
            when(courseRepository.findById(999L)).thenReturn(Optional.empty());

            RuntimeException ex = assertThrows(RuntimeException.class, () -> feedbackService.submitFeedback(request));
            assertEquals("Course not found", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Course not found", response.getBody().getMessage());
        }

        // 10. Duplicate student register number -> 409 CONFLICT
        @Test
        @DisplayName("10. Duplicate student register number -> 409 CONFLICT")
        void testDuplicateStudentRegisterNumber() {
            Student duplicate = new Student("23AIDS001", "Another Student");
            when(studentRepository.existsByRegisterNumber("23AIDS001")).thenReturn(true);

            RuntimeException ex = assertThrows(RuntimeException.class, () -> studentService.createStudent(duplicate));
            assertEquals("Register number already exists", ex.getMessage());

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(ex);
            assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Register number already exists", response.getBody().getMessage());
        }

        // 11. Blank student register number -> 400 BAD REQUEST
        @Test
        @DisplayName("11. Blank student register number -> 400 BAD REQUEST")
        void testBlankStudentRegisterNumber() throws NoSuchMethodException {
            Student invalid = new Student("", "Valid Name");
            Set<ConstraintViolation<Student>> violations = validator.validate(invalid);
            assertFalse(violations.isEmpty());

            BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(invalid, "student");
            bindingResult.addError(new FieldError("student", "registerNumber", "Register number is required"));

            Method method = StudentController.class.getMethod("createStudent", Student.class);
            org.springframework.core.MethodParameter methodParameter = new org.springframework.core.MethodParameter(method, 0);
            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidationException(ex);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Register number is required", response.getBody().getMessage());
        }

        // 12. Blank semester name -> 400 BAD REQUEST
        @Test
        @DisplayName("12. Blank semester name -> 400 BAD REQUEST")
        void testBlankSemesterName() throws NoSuchMethodException {
            Semester invalid = new Semester("", LocalDate.now().plusDays(5), true);
            Set<ConstraintViolation<Semester>> violations = validator.validate(invalid);
            assertFalse(violations.isEmpty());

            BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(invalid, "semester");
            bindingResult.addError(new FieldError("semester", "semesterName", "Semester name is required"));

            Method method = SemesterController.class.getMethod("createSemester", Semester.class);
            org.springframework.core.MethodParameter methodParameter = new org.springframework.core.MethodParameter(method, 0);
            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

            ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidationException(ex);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals("Semester name is required", response.getBody().getMessage());
        }
    }

    // =========================================================================
    // PART 5 — SUCCESS FLOWS
    // =========================================================================

    @Nested
    @DisplayName("Part 5 - Success Flows")
    class SuccessFlowTests {

        // Course CRUD
        @Test
        @DisplayName("Course CRUD: Create, Get, Update, Delete")
        void testCourseCrudSuccess() {
            Course c = new Course("CS101", "Java", "CSE");
            c.setId(1L);

            when(courseRepository.save(any(Course.class))).thenReturn(c);
            when(courseRepository.findById(1L)).thenReturn(Optional.of(c));
            when(courseRepository.findAll()).thenReturn(List.of(c));
            doNothing().when(courseRepository).delete(c);

            Course created = courseController.createCourse(c);
            assertEquals("CS101", created.getCourseCode());

            Course found = courseController.getCourseById(1L);
            assertEquals("Java", found.getCourseName());

            List<Course> list = courseController.getAllCourses();
            assertEquals(1, list.size());

            c.setCourseName("Advanced Java");
            Course updated = courseController.updateCourse(1L, c);
            assertEquals("Advanced Java", updated.getCourseName());

            String deleteMsg = courseController.deleteCourse(1L);
            assertEquals("Course deleted successfully", deleteMsg);
            verify(courseRepository).delete(c);
        }

        // Student CRUD
        @Test
        @DisplayName("Student CRUD: Create, Get, Update, Delete")
        void testStudentCrudSuccess() {
            Student s = new Student("23AIDS001", "Alice");
            s.setId(1L);

            when(studentRepository.existsByRegisterNumber("23AIDS001")).thenReturn(false);
            when(studentRepository.save(any(Student.class))).thenReturn(s);
            when(studentRepository.findById(1L)).thenReturn(Optional.of(s));
            when(studentRepository.findAll()).thenReturn(List.of(s));
            when(studentRepository.existsById(1L)).thenReturn(true);
            doNothing().when(studentRepository).deleteById(1L);

            Student created = studentController.createStudent(s);
            assertEquals("23AIDS001", created.getRegisterNumber());

            Student found = studentController.getStudentById(1L);
            assertEquals("Alice", found.getStudentName());

            List<Student> list = studentController.getAllStudents();
            assertEquals(1, list.size());

            s.setStudentName("Alice Smith");
            Student updated = studentController.updateStudent(1L, s);
            assertEquals("Alice Smith", updated.getStudentName());

            studentController.deleteStudent(1L);
            verify(studentRepository).deleteById(1L);
        }

        // Semester CRUD
        @Test
        @DisplayName("Semester CRUD: Create, Get, Update, Delete")
        void testSemesterCrudSuccess() {
            Semester sem = new Semester("Semester 1", LocalDate.now().plusDays(30), true);
            sem.setId(1L);

            when(semesterRepository.save(any(Semester.class))).thenReturn(sem);
            when(semesterRepository.findById(1L)).thenReturn(Optional.of(sem));
            when(semesterRepository.findAll()).thenReturn(List.of(sem));
            when(semesterRepository.existsById(1L)).thenReturn(true);
            doNothing().when(semesterRepository).deleteById(1L);

            Semester created = semesterController.createSemester(sem);
            assertEquals("Semester 1", created.getSemesterName());

            Semester found = semesterController.getSemesterById(1L);
            assertTrue(found.isFeedbackOpen());

            List<Semester> list = semesterController.getAllSemesters();
            assertEquals(1, list.size());

            sem.setSemesterName("Semester 1 - 2026");
            Semester updated = semesterController.updateSemester(1L, sem);
            assertEquals("Semester 1 - 2026", updated.getSemesterName());

            semesterController.deleteSemester(1L);
            verify(semesterRepository).deleteById(1L);
        }

        // Question CRUD
        @Test
        @DisplayName("Question CRUD: Create, Get, Update, Delete")
        void testQuestionCrudSuccess() {
            Question q = new Question("Clarity of explanation?");
            q.setId(1L);

            when(questionRepository.save(any(Question.class))).thenReturn(q);
            when(questionRepository.findById(1L)).thenReturn(Optional.of(q));
            when(questionRepository.findAll()).thenReturn(List.of(q));
            doNothing().when(questionRepository).delete(q);

            Question created = questionController.createQuestion(q);
            assertEquals("Clarity of explanation?", created.getQuestionText());

            Question found = questionController.getQuestionById(1L);
            assertEquals(1L, found.getId());

            List<Question> list = questionController.getAllQuestions();
            assertEquals(1, list.size());

            q.setQuestionText("Instructor clarity of explanation?");
            Question updated = questionController.updateQuestion(1L, q);
            assertEquals("Instructor clarity of explanation?", updated.getQuestionText());

            String deleteMsg = questionController.deleteQuestion(1L);
            assertEquals("Question deleted successfully", deleteMsg);
            verify(questionRepository).delete(q);
        }

        // Submit valid feedback
        @Test
        @DisplayName("Submit valid feedback success")
        void testSubmitValidFeedbackSuccess() {
            Student s = new Student("23AIDS001", "Student One");
            s.setId(1L);
            Course c = new Course("CS101", "Java", "CSE");
            c.setId(2L);
            Semester sem = new Semester("Semester 5", LocalDate.now().plusDays(10), true);
            sem.setId(3L);
            Question q = new Question("Punctuality");
            q.setId(4L);

            FeedbackRequest request = new FeedbackRequest(
                    1L, 2L, 3L,
                    List.of(new RatingRequest(4L, 5))
            );

            when(studentRepository.findById(1L)).thenReturn(Optional.of(s));
            when(courseRepository.findById(2L)).thenReturn(Optional.of(c));
            when(semesterRepository.findById(3L)).thenReturn(Optional.of(sem));
            when(feedbackRepository.existsByStudentIdAndCourseIdAndSemesterId(1L, 2L, 3L)).thenReturn(false);

            Feedback saved = new Feedback(s, c, sem);
            saved.setId(10L);
            when(feedbackRepository.save(any(Feedback.class))).thenReturn(saved);
            when(questionRepository.findById(4L)).thenReturn(Optional.of(q));
            when(feedbackResponseRepository.save(any(FeedbackResponse.class))).thenAnswer(inv -> inv.getArgument(0));

            Feedback result = feedbackController.submitFeedback(request);
            assertNotNull(result);
            assertEquals(10L, result.getId());
            assertEquals(1L, result.getStudent().getId());
            assertEquals(2L, result.getCourse().getId());
            assertEquals(3L, result.getSemester().getId());
        }

        // Fetch question averages
        @Test
        @DisplayName("Fetch question averages for a course")
        void testFetchQuestionAveragesSuccess() {
            Course c = new Course("CS101", "Java", "CSE");
            c.setId(1L);
            Question q = new Question("Clarity");
            q.setId(10L);

            FeedbackResponse r1 = new FeedbackResponse(new Feedback(), q, 4);
            FeedbackResponse r2 = new FeedbackResponse(new Feedback(), q, 5);

            when(courseRepository.existsById(1L)).thenReturn(true);
            when(feedbackResponseRepository.findByCourseId(1L)).thenReturn(List.of(r1, r2));

            List<QuestionAverageResponse> averages = feedbackController.getCourseQuestionAverages(1L);
            assertEquals(1, averages.size());
            assertEquals(10L, averages.get(0).getQuestionId());
            assertEquals("Clarity", averages.get(0).getQuestionText());
            assertEquals(4.5, averages.get(0).getAverageRating());
        }

        // Fetch dashboard summary
        @Test
        @DisplayName("Fetch dashboard summary success")
        void testFetchDashboardSummarySuccess() {
            when(courseRepository.count()).thenReturn(5L);
            when(questionRepository.count()).thenReturn(6L);
            when(feedbackRepository.count()).thenReturn(20L);
            when(feedbackResponseRepository.getOverallAverageRating()).thenReturn(4.25);
            when(studentRepository.count()).thenReturn(50L);
            when(semesterRepository.count()).thenReturn(3L);
            when(semesterRepository.countByFeedbackOpenTrue()).thenReturn(1L);

            DashboardSummaryResponse summary = dashboardController.getDashboardSummary();
            assertEquals(5L, summary.getTotalCourses());
            assertEquals(6L, summary.getTotalQuestions());
            assertEquals(20L, summary.getTotalFeedback());
            assertEquals(4.25, summary.getOverallAverageRating());
            assertEquals(50L, summary.getTotalStudents());
            assertEquals(3L, summary.getTotalSemesters());
            assertEquals(1L, summary.getOpenSemesters());
        }

        // Fetch faculty summary
        @Test
        @DisplayName("Fetch faculty summary success")
        void testFetchFacultySummarySuccess() {
            Course c = new Course("CS101", "Java", "CSE");
            c.setId(1L);

            when(courseRepository.findAll()).thenReturn(List.of(c));
            when(feedbackRepository.countByCourseId(1L)).thenReturn(4L);
            when(feedbackResponseRepository.getAverageRatingByCourseId(1L)).thenReturn(4.5);

            List<CourseFeedbackSummaryResponse> list = facultySummaryController.getCourseFeedbackSummary();
            assertEquals(1, list.size());
            assertEquals(4.5, list.get(0).getAverageRating());
            assertEquals(4L, list.get(0).getTotalFeedback());
        }

        // Open semester
        @Test
        @DisplayName("Open semester collection success")
        void testOpenSemesterSuccess() {
            Semester sem = new Semester("Semester 5", LocalDate.now().plusDays(10), false);
            sem.setId(1L);

            when(semesterRepository.findById(1L)).thenReturn(Optional.of(sem));
            when(semesterRepository.save(any(Semester.class))).thenAnswer(inv -> inv.getArgument(0));

            Semester updated = semesterController.openFeedback(1L);
            assertTrue(updated.isFeedbackOpen());
        }

        // Close semester
        @Test
        @DisplayName("Close semester collection success")
        void testCloseSemesterSuccess() {
            Semester sem = new Semester("Semester 5", LocalDate.now().plusDays(10), true);
            sem.setId(1L);

            when(semesterRepository.findById(1L)).thenReturn(Optional.of(sem));
            when(semesterRepository.save(any(Semester.class))).thenAnswer(inv -> inv.getArgument(0));

            Semester updated = semesterController.closeFeedback(1L);
            assertFalse(updated.isFeedbackOpen());
        }
    }
}
