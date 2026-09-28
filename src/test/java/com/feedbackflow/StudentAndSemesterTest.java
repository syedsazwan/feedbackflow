package com.feedbackflow;

import com.feedbackflow.controller.SemesterController;
import com.feedbackflow.controller.StudentController;
import com.feedbackflow.dto.ErrorResponse;
import com.feedbackflow.exception.GlobalExceptionHandler;
import com.feedbackflow.model.Semester;
import com.feedbackflow.model.Student;
import com.feedbackflow.repository.SemesterRepository;
import com.feedbackflow.repository.StudentRepository;
import com.feedbackflow.service.SemesterService;
import com.feedbackflow.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentAndSemesterTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SemesterRepository semesterRepository;

    private StudentService studentService;
    private SemesterService semesterService;
    private StudentController studentController;
    private SemesterController semesterController;
    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        studentService = new StudentService(studentRepository);
        semesterService = new SemesterService(semesterRepository);
        studentController = new StudentController(studentService);
        semesterController = new SemesterController(semesterService);
        exceptionHandler = new GlobalExceptionHandler();
    }

    // ==========================================
    // StudentService Tests
    // ==========================================

    @Test
    void testGetAllStudents() {
        when(studentRepository.findAll()).thenReturn(Arrays.asList(
                new Student("23AIDS001", "Student One"),
                new Student("23AIDS002", "Student Two")
        ));

        List<Student> students = studentService.getAllStudents();
        assertEquals(2, students.size());
    }

    @Test
    void testGetStudentById_Success() {
        Student student = new Student("23AIDS001", "Student One");
        student.setId(1L);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        Student found = studentService.getStudentById(1L);
        assertEquals("23AIDS001", found.getRegisterNumber());
        assertEquals("Student One", found.getStudentName());
    }

    @Test
    void testGetStudentById_NotFound() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> studentService.getStudentById(99L));
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    void testCreateStudent_Success() {
        Student input = new Student("23AIDS001", "Student One");
        when(studentRepository.existsByRegisterNumber("23AIDS001")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            s.setId(1L);
            return s;
        });

        Student created = studentService.createStudent(input);
        assertNotNull(created.getId());
        assertEquals("23AIDS001", created.getRegisterNumber());
    }

    @Test
    void testCreateStudent_BlankRegisterNumber() {
        Student input = new Student("", "Student One");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> studentService.createStudent(input));
        assertEquals("Register number is required", exception.getMessage());
    }

    @Test
    void testCreateStudent_BlankStudentName() {
        Student input = new Student("23AIDS001", "   ");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> studentService.createStudent(input));
        assertEquals("Student name is required", exception.getMessage());
    }

    @Test
    void testCreateStudent_DuplicateRegisterNumber() {
        Student input = new Student("23AIDS001", "Student One");
        when(studentRepository.existsByRegisterNumber("23AIDS001")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> studentService.createStudent(input));
        assertEquals("Register number already exists", exception.getMessage());
    }

    @Test
    void testUpdateStudent_Success() {
        Student existing = new Student("23AIDS001", "Student One");
        existing.setId(1L);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Student updateInfo = new Student("23AIDS001_UPDATED", "Student One Renamed");
        Student updated = studentService.updateStudent(1L, updateInfo);

        assertEquals("23AIDS001_UPDATED", updated.getRegisterNumber());
        assertEquals("Student One Renamed", updated.getStudentName());
    }

    @Test
    void testUpdateStudent_DuplicateRegisterNumber() {
        Student existing = new Student("23AIDS001", "Student One");
        existing.setId(1L);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(studentRepository.existsByRegisterNumber("23AIDS999")).thenReturn(true);

        Student updateInfo = new Student("23AIDS999", "Student One");
        RuntimeException exception = assertThrows(RuntimeException.class, () -> studentService.updateStudent(1L, updateInfo));
        assertEquals("Register number already exists", exception.getMessage());
    }

    @Test
    void testDeleteStudent_Success() {
        when(studentRepository.existsById(1L)).thenReturn(true);

        studentService.deleteStudent(1L);
        verify(studentRepository).deleteById(1L);
    }

    @Test
    void testDeleteStudent_NotFound() {
        when(studentRepository.existsById(99L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> studentService.deleteStudent(99L));
        assertEquals("Student not found", exception.getMessage());
    }

    // ==========================================
    // SemesterService Tests
    // ==========================================

    @Test
    void testGetAllSemesters() {
        when(semesterRepository.findAll()).thenReturn(Arrays.asList(
                new Semester("Semester 5 - 2026", LocalDate.of(2026, 10, 15), true)
        ));

        List<Semester> semesters = semesterService.getAllSemesters();
        assertEquals(1, semesters.size());
    }

    @Test
    void testGetSemesterById_Success() {
        Semester sem = new Semester("Semester 5 - 2026", LocalDate.of(2026, 10, 15), true);
        sem.setId(1L);
        when(semesterRepository.findById(1L)).thenReturn(Optional.of(sem));

        Semester found = semesterService.getSemesterById(1L);
        assertEquals("Semester 5 - 2026", found.getSemesterName());
    }

    @Test
    void testGetSemesterById_NotFound() {
        when(semesterRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> semesterService.getSemesterById(99L));
        assertEquals("Semester not found", exception.getMessage());
    }

    @Test
    void testCreateSemester_Success() {
        Semester input = new Semester("Semester 5 - 2026", LocalDate.of(2026, 10, 15), true);
        when(semesterRepository.save(any(Semester.class))).thenAnswer(invocation -> {
            Semester s = invocation.getArgument(0);
            s.setId(1L);
            return s;
        });

        Semester created = semesterService.createSemester(input);
        assertNotNull(created.getId());
        assertEquals("Semester 5 - 2026", created.getSemesterName());
    }

    @Test
    void testCreateSemester_BlankName() {
        Semester input = new Semester("  ", LocalDate.of(2026, 10, 15), true);
        RuntimeException exception = assertThrows(RuntimeException.class, () -> semesterService.createSemester(input));
        assertEquals("Semester name is required", exception.getMessage());
    }

    @Test
    void testUpdateSemester_Success() {
        Semester existing = new Semester("Semester 5 - 2026", LocalDate.of(2026, 10, 15), true);
        existing.setId(1L);
        when(semesterRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(semesterRepository.save(any(Semester.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Semester updateInfo = new Semester("Semester 6 - 2026", LocalDate.of(2026, 12, 1), false);
        Semester updated = semesterService.updateSemester(1L, updateInfo);

        assertEquals("Semester 6 - 2026", updated.getSemesterName());
        assertEquals(LocalDate.of(2026, 12, 1), updated.getFeedbackDeadline());
        assertEquals(false, updated.isFeedbackOpen());
    }

    @Test
    void testDeleteSemester_Success() {
        when(semesterRepository.existsById(1L)).thenReturn(true);

        semesterService.deleteSemester(1L);
        verify(semesterRepository).deleteById(1L);
    }

    @Test
    void testDeleteSemester_NotFound() {
        when(semesterRepository.existsById(99L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> semesterService.deleteSemester(99L));
        assertEquals("Semester not found", exception.getMessage());
    }

    // ==========================================
    // Controller Tests
    // ==========================================

    @Test
    void testStudentControllerEndpoints() {
        Student s = new Student("23AIDS001", "Student One");
        when(studentRepository.save(any(Student.class))).thenReturn(s);

        Student created = studentController.createStudent(s);
        assertEquals("23AIDS001", created.getRegisterNumber());

        when(studentRepository.existsById(1L)).thenReturn(true);
        ResponseEntity<Map<String, String>> deleteResponse = studentController.deleteStudent(1L);
        assertEquals(HttpStatus.OK, deleteResponse.getStatusCode());
        assertEquals("Student deleted successfully", deleteResponse.getBody().get("message"));
    }

    @Test
    void testSemesterControllerEndpoints() {
        Semester sem = new Semester("Semester 5 - 2026", LocalDate.of(2026, 10, 15), true);
        when(semesterRepository.save(any(Semester.class))).thenReturn(sem);

        Semester created = semesterController.createSemester(sem);
        assertEquals("Semester 5 - 2026", created.getSemesterName());

        when(semesterRepository.existsById(1L)).thenReturn(true);
        ResponseEntity<Map<String, String>> deleteResponse = semesterController.deleteSemester(1L);
        assertEquals(HttpStatus.OK, deleteResponse.getStatusCode());
        assertEquals("Semester deleted successfully", deleteResponse.getBody().get("message"));
    }

    // ==========================================
    // GlobalExceptionHandler Tests
    // ==========================================

    @Test
    void testExceptionHandler_NotFoundMapping() {
        ResponseEntity<ErrorResponse> resp1 = exceptionHandler.handleRuntimeException(new RuntimeException("Student not found"));
        assertEquals(HttpStatus.NOT_FOUND, resp1.getStatusCode());
        assertEquals(404, resp1.getBody().getStatus());
        assertEquals("Not Found", resp1.getBody().getError());
        assertEquals("Student not found", resp1.getBody().getMessage());
        assertNotNull(resp1.getBody().getTimestamp());

        ResponseEntity<ErrorResponse> resp2 = exceptionHandler.handleRuntimeException(new RuntimeException("Course not found"));
        assertEquals(HttpStatus.NOT_FOUND, resp2.getStatusCode());

        ResponseEntity<ErrorResponse> resp3 = exceptionHandler.handleRuntimeException(new RuntimeException("Semester not found"));
        assertEquals(HttpStatus.NOT_FOUND, resp3.getStatusCode());

        ResponseEntity<ErrorResponse> resp4 = exceptionHandler.handleRuntimeException(new RuntimeException("Question not found"));
        assertEquals(HttpStatus.NOT_FOUND, resp4.getStatusCode());
    }

    @Test
    void testExceptionHandler_ConflictMapping() {
        ResponseEntity<ErrorResponse> resp1 = exceptionHandler.handleRuntimeException(
                new RuntimeException("Feedback already submitted for this course in this semester")
        );
        assertEquals(HttpStatus.CONFLICT, resp1.getStatusCode());
        assertEquals(409, resp1.getBody().getStatus());
        assertEquals("Conflict", resp1.getBody().getError());
        assertEquals("Feedback already submitted for this course in this semester", resp1.getBody().getMessage());

        ResponseEntity<ErrorResponse> resp2 = exceptionHandler.handleRuntimeException(
                new RuntimeException("Register number already exists")
        );
        assertEquals(HttpStatus.CONFLICT, resp2.getStatusCode());
        assertEquals(409, resp2.getBody().getStatus());
    }

    @Test
    void testExceptionHandler_BadRequestMapping() {
        ResponseEntity<ErrorResponse> resp1 = exceptionHandler.handleRuntimeException(
                new RuntimeException("Rating must be between 1 and 5")
        );
        assertEquals(HttpStatus.BAD_REQUEST, resp1.getStatusCode());
        assertEquals(400, resp1.getBody().getStatus());
        assertEquals("Bad Request", resp1.getBody().getError());

        ResponseEntity<ErrorResponse> resp2 = exceptionHandler.handleRuntimeException(
                new RuntimeException("At least one rating is required")
        );
        assertEquals(HttpStatus.BAD_REQUEST, resp2.getStatusCode());

        ResponseEntity<ErrorResponse> resp3 = exceptionHandler.handleRuntimeException(
                new RuntimeException("Feedback submission is closed for this semester")
        );
        assertEquals(HttpStatus.BAD_REQUEST, resp3.getStatusCode());

        ResponseEntity<ErrorResponse> resp4 = exceptionHandler.handleRuntimeException(
                new RuntimeException("Feedback deadline has passed")
        );
        assertEquals(HttpStatus.BAD_REQUEST, resp4.getStatusCode());

        ResponseEntity<ErrorResponse> resp5 = exceptionHandler.handleRuntimeException(
                new RuntimeException("Register number is required")
        );
        assertEquals(HttpStatus.BAD_REQUEST, resp5.getStatusCode());
    }
}
