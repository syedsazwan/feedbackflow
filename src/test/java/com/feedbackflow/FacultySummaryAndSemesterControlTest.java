package com.feedbackflow;

import com.feedbackflow.controller.FacultySummaryController;
import com.feedbackflow.controller.SemesterController;
import com.feedbackflow.dto.CourseFeedbackSummaryResponse;
import com.feedbackflow.dto.SemesterStatusResponse;
import com.feedbackflow.model.Course;
import com.feedbackflow.model.Semester;
import com.feedbackflow.repository.CourseRepository;
import com.feedbackflow.repository.FeedbackRepository;
import com.feedbackflow.repository.FeedbackResponseRepository;
import com.feedbackflow.repository.SemesterRepository;
import com.feedbackflow.service.FacultySummaryService;
import com.feedbackflow.service.SemesterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FacultySummaryAndSemesterControlTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private FeedbackResponseRepository feedbackResponseRepository;

    @Mock
    private SemesterRepository semesterRepository;

    private FacultySummaryService facultySummaryService;
    private FacultySummaryController facultySummaryController;

    private SemesterService semesterService;
    private SemesterController semesterController;

    @BeforeEach
    void setUp() {
        facultySummaryService = new FacultySummaryService(courseRepository, feedbackRepository, feedbackResponseRepository);
        facultySummaryController = new FacultySummaryController(facultySummaryService);

        semesterService = new SemesterService(semesterRepository);
        semesterController = new SemesterController(semesterService);
    }

    // ========================================================
    // 1. Faculty summary with feedback
    // ========================================================
    @Test
    void testFacultySummaryWithFeedback() {
        Course c1 = new Course("CS101", "Java Programming", "CSE");
        c1.setId(1L);

        when(courseRepository.findAll()).thenReturn(List.of(c1));
        when(feedbackRepository.countByCourseId(1L)).thenReturn(3L);
        when(feedbackResponseRepository.getAverageRatingByCourseId(1L)).thenReturn(4.2333);

        List<CourseFeedbackSummaryResponse> summaries = facultySummaryController.getCourseFeedbackSummary();

        assertEquals(1, summaries.size());
        CourseFeedbackSummaryResponse summary = summaries.get(0);
        assertEquals(1L, summary.getCourseId());
        assertEquals("CS101", summary.getCourseCode());
        assertEquals("Java Programming", summary.getCourseName());
        assertEquals("CSE", summary.getDepartment());
        assertEquals(3L, summary.getTotalFeedback());
        assertEquals(4.2, summary.getAverageRating());
    }

    // ========================================================
    // 2. Faculty summary with no feedback
    // ========================================================
    @Test
    void testFacultySummaryWithNoFeedback() {
        Course c1 = new Course("CS102", "Python Basics", "CSE");
        c1.setId(2L);

        when(courseRepository.findAll()).thenReturn(List.of(c1));
        when(feedbackRepository.countByCourseId(2L)).thenReturn(0L);

        List<CourseFeedbackSummaryResponse> summaries = facultySummaryService.getCourseFeedbackSummary();

        assertEquals(1, summaries.size());
        CourseFeedbackSummaryResponse summary = summaries.get(0);
        assertEquals(2L, summary.getCourseId());
        assertEquals(0L, summary.getTotalFeedback());
        assertEquals(0.0, summary.getAverageRating());
    }

    // ========================================================
    // 3. Single-course faculty summary
    // ========================================================
    @Test
    void testSingleCourseFacultySummary() {
        Course c1 = new Course("CS101", "Java Programming", "CSE");
        c1.setId(1L);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(c1));
        when(feedbackRepository.countByCourseId(1L)).thenReturn(5L);
        when(feedbackResponseRepository.getAverageRatingByCourseId(1L)).thenReturn(4.78);

        CourseFeedbackSummaryResponse summary = facultySummaryController.getCourseFeedbackSummaryById(1L);

        assertNotNull(summary);
        assertEquals(1L, summary.getCourseId());
        assertEquals("CS101", summary.getCourseCode());
        assertEquals(5L, summary.getTotalFeedback());
        assertEquals(4.8, summary.getAverageRating());
    }

    // ========================================================
    // 4. Course not found
    // ========================================================
    @Test
    void testSingleCourseSummary_NotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                facultySummaryController.getCourseFeedbackSummaryById(99L)
        );
        assertEquals("Course not found", exception.getMessage());
    }

    // ========================================================
    // 5. Semester open endpoint/service
    // ========================================================
    @Test
    void testSemesterOpenFeedback() {
        Semester semester = new Semester("Semester 5 - 2026", LocalDate.of(2026, 10, 15), false);
        semester.setId(1L);

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));
        when(semesterRepository.save(any(Semester.class))).thenAnswer(inv -> inv.getArgument(0));

        Semester updated = semesterController.openFeedback(1L);

        assertTrue(updated.isFeedbackOpen());
        verify(semesterRepository).save(semester);
    }

    // ========================================================
    // 6. Semester close endpoint/service
    // ========================================================
    @Test
    void testSemesterCloseFeedback() {
        Semester semester = new Semester("Semester 5 - 2026", LocalDate.of(2026, 10, 15), true);
        semester.setId(1L);

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));
        when(semesterRepository.save(any(Semester.class))).thenAnswer(inv -> inv.getArgument(0));

        Semester updated = semesterController.closeFeedback(1L);

        assertFalse(updated.isFeedbackOpen());
        verify(semesterRepository).save(semester);
    }

    // ========================================================
    // 7. isFeedbackSubmissionAllowed
    // ========================================================
    @Test
    void testIsFeedbackSubmissionAllowed_OpenAndFutureDeadline() {
        Semester openSemester = new Semester("Semester 5 - 2026", LocalDate.now().plusDays(10), true);
        openSemester.setId(1L);

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(openSemester));

        boolean allowed = semesterService.isFeedbackSubmissionAllowed(1L);
        assertTrue(allowed);

        // Also test status endpoint
        SemesterStatusResponse status = semesterController.getSemesterStatus(1L);
        assertTrue(status.isSubmissionAllowed());
        assertTrue(status.isFeedbackOpen());
        assertEquals("Semester 5 - 2026", status.getSemesterName());
    }

    @Test
    void testIsFeedbackSubmissionAllowed_Closed() {
        Semester closedSemester = new Semester("Semester 5 - 2026", LocalDate.now().plusDays(10), false);
        closedSemester.setId(2L);

        when(semesterRepository.findById(2L)).thenReturn(Optional.of(closedSemester));

        boolean allowed = semesterService.isFeedbackSubmissionAllowed(2L);
        assertFalse(allowed);
    }

    @Test
    void testIsFeedbackSubmissionAllowed_DeadlinePassed() {
        Semester expiredSemester = new Semester("Semester 5 - 2026", LocalDate.now().minusDays(1), true);
        expiredSemester.setId(3L);

        when(semesterRepository.findById(3L)).thenReturn(Optional.of(expiredSemester));

        boolean allowed = semesterService.isFeedbackSubmissionAllowed(3L);
        assertFalse(allowed);
    }

    @Test
    void testIsFeedbackSubmissionAllowed_NullDeadlineAndOpen() {
        Semester openNoDeadline = new Semester("Semester 5 - 2026", null, true);
        openNoDeadline.setId(4L);

        when(semesterRepository.findById(4L)).thenReturn(Optional.of(openNoDeadline));

        boolean allowed = semesterService.isFeedbackSubmissionAllowed(4L);
        assertTrue(allowed);
    }
}
